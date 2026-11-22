from pathlib import Path
from io import BytesIO
from functools import lru_cache
import json

import joblib
import numpy as np
import pandas as pd
from PIL import Image
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jwt.exceptions import InvalidTokenError
from pydantic import BaseModel, Field

from app.auth import get_db
from app.models import User, PredictionHistory
from app.security import decode_access_token


router = APIRouter(prefix="/api/predict", tags=["Disease Prediction"])
security = HTTPBearer()
PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = PROJECT_ROOT / "ml" / "models"


# =========================================
# AUTHENTICATION
# =========================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication token.")
        user_id = int(user_id)
    except (InvalidTokenError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token.")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User associated with this token was not found.")
    return user


def save_prediction(
    db: Session,
    user: User,
    disease: str,
    prediction: int,
    probability: float,
    message: str,
):
    history = PredictionHistory(
        user_id=user.id,
        disease=disease,
        prediction=prediction,
        estimated_probability=probability,
        message=message,
    )
    db.add(history)
    db.commit()
    return {
        "prediction": prediction,
        "estimated_probability": probability,
        "message": message,
    }


# =========================================
# LIGHTWEIGHT CLASSICAL MODELS
# =========================================

DIABETES_MODEL_PATH = MODEL_DIR / "diabetes_model.pkl"
HEART_MODEL_PATH = MODEL_DIR / "heart_disease_model.joblib"


@lru_cache(maxsize=1)
def get_diabetes_model():
    if not DIABETES_MODEL_PATH.exists():
        raise RuntimeError(f"Diabetes model file not found: {DIABETES_MODEL_PATH}")
    return joblib.load(DIABETES_MODEL_PATH)


@lru_cache(maxsize=1)
def get_heart_model():
    if not HEART_MODEL_PATH.exists():
        raise RuntimeError(f"Heart disease model file not found: {HEART_MODEL_PATH}")
    return joblib.load(HEART_MODEL_PATH)


# =========================================
# OPTIONAL SHAP EXPLAINABILITY
# SHAP is imported only when an explanation is requested.
# =========================================

DIABETES_FEATURES = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age",
]

diabetes_background = pd.DataFrame(
    [
        [0, 85, 60, 15, 0, 22.0, 0.10, 21],
        [1, 100, 65, 20, 30, 25.0, 0.20, 25],
        [2, 110, 70, 25, 60, 28.0, 0.30, 30],
        [3, 120, 72, 28, 80, 30.0, 0.40, 35],
        [4, 130, 75, 30, 100, 32.0, 0.50, 40],
        [5, 140, 80, 32, 120, 35.0, 0.70, 45],
        [6, 150, 82, 35, 150, 38.0, 1.00, 50],
        [8, 160, 85, 40, 180, 42.0, 1.50, 60],
    ],
    columns=DIABETES_FEATURES,
)

HEART_FEATURES = [
    "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
    "thalach", "exang", "oldpeak", "slope", "ca", "thal",
]

heart_background = pd.DataFrame(
    [
        [45, 1, 0, 120, 200, 0, 0, 160, 0, 0.0, 1, 0, 2],
        [50, 0, 1, 130, 220, 0, 1, 150, 0, 1.0, 1, 0, 2],
        [55, 1, 2, 140, 240, 0, 0, 145, 1, 1.5, 1, 1, 3],
        [60, 1, 0, 150, 260, 1, 1, 130, 1, 2.0, 2, 1, 3],
        [65, 0, 2, 135, 230, 0, 0, 140, 0, 0.5, 1, 0, 2],
        [40, 1, 3, 125, 190, 0, 1, 170, 0, 0.0, 0, 0, 2],
        [58, 1, 1, 145, 250, 0, 0, 135, 1, 1.8, 2, 2, 3],
        [62, 0, 0, 130, 210, 0, 1, 155, 0, 0.3, 1, 0, 2],
    ],
    columns=HEART_FEATURES,
)


def _build_shap_explanation(model, background, patient, feature_names, disease):
    # Lazy import is important on low-memory deployments.
    try:
        import shap
    except ImportError as error:
        raise HTTPException(
            status_code=503,
            detail="SHAP explanations are unavailable on this deployment.",
        ) from error

    try:
        if hasattr(model, "steps") and len(model.steps) > 1:
            preprocessing = model[:-1]
            classifier = model.steps[-1][1]
            background_transformed = preprocessing.transform(background)
            patient_transformed = preprocessing.transform(patient)
        elif hasattr(model, "steps"):
            classifier = model.steps[-1][1]
            background_transformed = background
            patient_transformed = patient
        else:
            classifier = model
            background_transformed = background
            patient_transformed = patient

        background_array = np.asarray(background_transformed)
        patient_array = np.asarray(patient_transformed)

        try:
            explainer = shap.TreeExplainer(classifier, data=background_array)
            shap_values = explainer.shap_values(patient_array)
            base_values = explainer.expected_value
        except Exception:
            explainer = shap.KernelExplainer(classifier.predict_proba, background_array)
            shap_values = explainer.shap_values(patient_array, nsamples=100)
            base_values = explainer.expected_value

        if isinstance(shap_values, list):
            class_values = np.asarray(shap_values[1])
        else:
            class_values = np.asarray(shap_values)
            if class_values.ndim == 3 and class_values.shape[-1] > 1:
                class_values = class_values[:, :, 1]

        contributions = class_values[0].flatten()
        base_array = np.asarray(base_values)
        base_value = float(base_array.flatten()[1] if base_array.size > 1 else base_array.flatten()[0])

        names = feature_names if len(contributions) == len(feature_names) else [
            f"Transformed feature {index + 1}" for index in range(len(contributions))
        ]
        features = [
            {"feature": name, "contribution": round(float(value), 6)}
            for name, value in zip(names, contributions)
        ]
        features.sort(key=lambda item: abs(item["contribution"]), reverse=True)

        return {
            "disease": disease,
            "base_value": round(base_value, 6),
            "features": features,
            "note": (
                "Educational model explanation only. Contributions are relative "
                "to representative reference data and are not a medical diagnosis."
            ),
        }
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not generate {disease} SHAP explanation: {error}",
        ) from error


# =========================================
# DIABETES PREDICTION AND EXPLANATION
# =========================================

class DiabetesInput(BaseModel):
    Pregnancies: int = Field(ge=0)
    Glucose: float = Field(ge=0)
    BloodPressure: float = Field(ge=0)
    SkinThickness: float = Field(ge=0)
    Insulin: float = Field(ge=0)
    BMI: float = Field(ge=0)
    DiabetesPedigreeFunction: float = Field(ge=0)
    Age: int = Field(ge=1)


@router.post("/diabetes")
def predict_diabetes(
    data: DiabetesInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient_data = pd.DataFrame([data.model_dump()])
    model = get_diabetes_model()
    prediction = int(model.predict(patient_data)[0])
    probability = round(float(model.predict_proba(patient_data)[0][1]) * 100, 2)
    message = (
        "Model predicted diabetes risk"
        if prediction == 1
        else "Model predicted lower diabetes risk"
    )
    return save_prediction(db, current_user, "Diabetes", prediction, probability, message)


@router.post("/diabetes/explain")
def explain_diabetes(
    data: DiabetesInput,
    current_user: User = Depends(get_current_user),
):
    patient = pd.DataFrame([data.model_dump()], columns=DIABETES_FEATURES)
    return _build_shap_explanation(
        get_diabetes_model(), diabetes_background, patient,
        DIABETES_FEATURES, "Diabetes",
    )


# =========================================
# HEART DISEASE PREDICTION AND EXPLANATION
# =========================================

class HeartDiseaseInput(BaseModel):
    age: int = Field(ge=1)
    sex: int = Field(ge=0, le=1)
    cp: int = Field(ge=0, le=3)
    trestbps: float = Field(ge=0)
    chol: float = Field(ge=0)
    fbs: int = Field(ge=0, le=1)
    restecg: int = Field(ge=0, le=2)
    thalach: float = Field(ge=0)
    exang: int = Field(ge=0, le=1)
    oldpeak: float = Field(ge=0)
    slope: int = Field(ge=0, le=2)
    ca: float = Field(ge=0, le=4)
    thal: int = Field(ge=0, le=7)


@router.post("/heart")
def predict_heart_disease(
    data: HeartDiseaseInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient_data = pd.DataFrame([data.model_dump()], columns=HEART_FEATURES)
    model = get_heart_model()
    prediction = int(model.predict(patient_data)[0])
    probability = round(float(model.predict_proba(patient_data)[0][1]) * 100, 2)
    message = (
        "Model predicted disease risk"
        if prediction == 1
        else "Model predicted lower disease risk"
    )
    return save_prediction(db, current_user, "Heart Disease", prediction, probability, message)


@router.post("/heart/explain")
def explain_heart_disease(
    data: HeartDiseaseInput,
    current_user: User = Depends(get_current_user),
):
    patient = pd.DataFrame([data.model_dump()], columns=HEART_FEATURES)
    return _build_shap_explanation(
        get_heart_model(), heart_background, patient,
        HEART_FEATURES, "Heart Disease",
    )


# =========================================
# PNEUMONIA: DISABLED ON LOW-MEMORY HOSTS
# TensorFlow is not imported during API startup.
# Enable with ENABLE_PNEUMONIA_MODEL=true only on a
# service with sufficient RAM (preferably 2-4 GB).
# =========================================

PNEUMONIA_IMAGE_SIZE = (160, 160)


@lru_cache(maxsize=1)
def get_pneumonia_model():
    import os

    if os.getenv("ENABLE_PNEUMONIA_MODEL", "false").lower() != "true":
        raise HTTPException(
            status_code=503,
            detail=(
                "Pneumonia analysis is temporarily unavailable on this "
                "low-memory deployment. Diabetes and Heart Disease "
                "assessments remain available."
            ),
        )

    model_path = MODEL_DIR / "pneumonia_model.keras"
    if not model_path.exists():
        raise HTTPException(
            status_code=503,
            detail="Pneumonia model file is not installed on this deployment.",
        )

    try:
        import tensorflow as tf
        return tf.keras.models.load_model(model_path)
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail=f"Pneumonia model could not be loaded: {error}",
        ) from error


@router.post("/pneumonia")
async def predict_pneumonia(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check availability before accepting/processing the image.
    model = get_pneumonia_model()

    if file.content_type not in {"image/jpeg", "image/png", "image/jpg", "image/pjpeg"}:
        raise HTTPException(status_code=400, detail="Please upload a JPG or PNG chest X-ray image.")

    try:
        image_bytes = await file.read()
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        image = image.resize(PNEUMONIA_IMAGE_SIZE)
        image_array = np.expand_dims(np.asarray(image, dtype=np.float32), axis=0)

        model_output = model.predict(image_array, verbose=0)
        pneumonia_probability = float(model_output[0][0])
        prediction = 1 if pneumonia_probability >= 0.5 else 0
        probability = round(pneumonia_probability * 100, 2)
        message = (
            "Model detected pneumonia-like patterns"
            if prediction == 1
            else "Model predicted a normal X-ray pattern"
        )
        return save_prediction(db, current_user, "Pneumonia", prediction, probability, message)
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Could not process the X-ray image: {error}",
        ) from error


# =========================================
# USER PREDICTION HISTORY
# =========================================

@router.get("/history")
def get_prediction_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    history = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.user_id == current_user.id)
        .order_by(PredictionHistory.created_at.desc())
        .all()
    )
    return [
        {
            "id": item.id,
            "disease": item.disease,
            "prediction": item.prediction,
            "estimated_probability": item.estimated_probability,
            "message": item.message,
            "created_at": item.created_at,
        }
        for item in history
    ]


# =========================================
# MODEL PERFORMANCE METRICS
# =========================================

@router.get("/performance")
def get_model_performance(
    current_user: User = Depends(get_current_user),
):
    metrics_path = MODEL_DIR / "performance_metrics.json"
    if not metrics_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Performance metrics file not found. Please run the model evaluation script first.",
        )

    try:
        with metrics_path.open("r", encoding="utf-8") as file:
            metrics = json.load(file)

        comparison_path = MODEL_DIR / "pneumonia_comparison_metrics.json"
        if comparison_path.exists():
            with comparison_path.open("r", encoding="utf-8") as file:
                metrics.update(json.load(file))

        return metrics
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not load performance metrics: {error}",
        ) from error
