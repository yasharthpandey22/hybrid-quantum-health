from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import router as auth_router
from app.database import engine, Base
from app import models
from app.prediction import router as prediction_router


app = FastAPI(
    title="QuantumHealth API",
    description="Hybrid Quantum ML for Early Disease Detection",
    version="1.1.0",
)

app.include_router(auth_router)
app.include_router(prediction_router)

# Create tables without loading any heavyweight ML framework.
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to QuantumHealth API",
        "status": "Backend is running",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "available_assessments": ["Diabetes", "Heart Disease"],
        "pneumonia_enabled": False,
    }
