
import { useState } from "react";
import api from "../api/axios";
import "./Heart.css";

function Heart() {
  const [form, setForm] = useState({
    age: "",
    sex: "1",
    cp: "0",
    trestbps: "",
    chol: "",
    fbs: "0",
    restecg: "0",
    thalach: "",
    exang: "0",
    oldpeak: "0",
    slope: "0",
    ca: "0",
    thal: "2",
  });

  const [result, setResult] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [error, setError] = useState("");
  const [explanationError, setExplanationError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setExplanation(null);
    setExplanationError("");
  };

  const getPayload = () => {
    const payload = {};

    Object.keys(form).forEach((key) => {
      payload[key] = Number(form[key]);
    });

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setExplanation(null);
    setExplanationError("");

    try {
      const response = await api.post(
        "/api/predict/heart",
        getPayload()
      );

      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Prediction failed. Please check your inputs."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    setExplaining(true);
    setExplanationError("");
    setExplanation(null);

    try {
      const response = await api.post(
        "/api/predict/heart/explain",
        getPayload()
      );

      setExplanation(response.data);
    } catch (err) {
      setExplanationError(
        err.response?.data?.detail ||
          "Could not generate the explanation."
      );
    } finally {
      setExplaining(false);
    }
  };

  const fields = [
    {
      name: "age",
      label: "Age (years)",
      type: "number",
      min: 1,
      max: 120,
    },
    {
      name: "sex",
      label: "Sex",
      type: "select",
      options: [
        { value: "1", label: "Male" },
        { value: "0", label: "Female" },
      ],
    },
    {
      name: "cp",
      label: "Chest Pain Type",
      type: "select",
      options: [
        { value: "0", label: "Type 0" },
        { value: "1", label: "Type 1" },
        { value: "2", label: "Type 2" },
        { value: "3", label: "Type 3" },
      ],
    },
    {
      name: "trestbps",
      label: "Resting Blood Pressure (mm Hg)",
      type: "number",
      min: 50,
      max: 250,
    },
    {
      name: "chol",
      label: "Serum Cholesterol (mg/dl)",
      type: "number",
      min: 50,
      max: 700,
    },
    {
      name: "fbs",
      label: "Fasting Blood Sugar > 120",
      type: "select",
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" },
      ],
    },
    {
      name: "restecg",
      label: "Resting ECG",
      type: "select",
      options: [
        { value: "0", label: "ECG Type 0" },
        { value: "1", label: "ECG Type 1" },
        { value: "2", label: "ECG Type 2" },
      ],
    },
    {
      name: "thalach",
      label: "Maximum Heart Rate",
      type: "number",
      min: 50,
      max: 250,
    },
    {
      name: "exang",
      label: "Exercise Induced Angina",
      type: "select",
      options: [
        { value: "0", label: "No" },
        { value: "1", label: "Yes" },
      ],
    },
    {
      name: "oldpeak",
      label: "Oldpeak",
      type: "number",
      min: 0,
      max: 10,
    },
    {
      name: "slope",
      label: "ST Slope",
      type: "select",
      options: [
        { value: "0", label: "Slope 0" },
        { value: "1", label: "Slope 1" },
        { value: "2", label: "Slope 2" },
      ],
    },
    {
      name: "ca",
      label: "Number of Major Vessels",
      type: "select",
      options: [
        { value: "0", label: "0" },
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
      ],
    },
    {
      name: "thal",
      label: "Thal (dataset code)",
      type: "select",
      options: [
        { value: "0", label: "Code 0" },
        { value: "1", label: "Code 1" },
        { value: "2", label: "Code 2" },
        { value: "3", label: "Code 3" },
      ],
    },
  ];

  const maxContribution = explanation
    ? Math.max(
        ...explanation.features.map((item) =>
          Math.abs(item.contribution)
        ),
        0.000001
      )
    : 1;

  return (
    <div className="heart-page">
      <div className="heart-container">
        <header className="heart-header">
          <h1>Heart Disease Risk Prediction</h1>
          <p>
            Enter the required health parameters to get a
            model-based prediction.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="heart-form">
          {fields.map((field) => (
            <div className="form-group" key={field.name}>
              <label htmlFor={field.name}>
                {field.label}
              </label>

              {field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  required
                >
                  {field.options.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type="number"
                  value={form[field.name]}
                  onChange={handleChange}
                  min={field.min}
                  max={field.max}
                  step="any"
                  required
                />
              )}
            </div>
          ))}

          <button type="submit" disabled={loading}>
            {loading
              ? "Predicting..."
              : "Predict Heart Disease"}
          </button>
        </form>

        {error && (
          <p className="error-message">{error}</p>
        )}

        {result && (
          <div className="prediction-result">
            <h2>
              {result.prediction === 1
                ? "Higher Predicted Risk"
                : "Lower Predicted Risk"}
            </h2>

            <p>
              Estimated model probability:{" "}
              <strong>
                {result.estimated_probability}%
              </strong>
            </p>

            <p>{result.message}</p>

            <button
              type="button"
              disabled
              title="SHAP explanations are paused on the low-memory deployment"
            >
              Explanations temporarily unavailable
            </button>
            <p style={{ color: "#b45309", fontSize: "13px", marginTop: "8px" }}>
              The prediction is available, but detailed SHAP explanations are
              paused to keep the free backend within its memory limit.
            </p>

            {explanationError && (
              <p className="error-message">
                {explanationError}
              </p>
            )}

            {explanation && (
              <div
                style={{
                  marginTop: "24px",
                  padding: "20px",
                  background: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                  color: "#0f172a",
                }}
              >
                <h2>
                  Why did the model make this prediction?
                </h2>

                <p style={{ color: "#64748b" }}>
                  SHAP shows how each feature influenced
                  the model output relative to reference data.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    flexWrap: "wrap",
                    margin: "16px 0",
                    fontSize: "14px",
                  }}
                >
                  <span>
                    <span style={{ color: "#dc2626" }}>■</span>{" "}
                    Increased model output
                  </span>

                  <span>
                    <span style={{ color: "#2563eb" }}>■</span>{" "}
                    Decreased model output
                  </span>
                </div>

                <p>
                  Base value:{" "}
                  <strong>{explanation.base_value}</strong>
                </p>

                {explanation.features.map((item) => {
                  const positive = item.contribution >= 0;
                  const width =
                    (Math.abs(item.contribution) /
                      maxContribution) *
                    100;

                  return (
                    <div
                      key={item.feature}
                      style={{ marginBottom: "16px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "12px",
                          marginBottom: "6px",
                          fontWeight: 600,
                        }}
                      >
                        <span>{item.feature}</span>

                        <span
                          style={{
                            color: positive
                              ? "#dc2626"
                              : "#2563eb",
                          }}
                        >
                          {positive ? "+" : ""}
                          {item.contribution}
                        </span>
                      </div>

                      <div
                        style={{
                          height: "14px",
                          background: "#e2e8f0",
                          borderRadius: "20px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${width}%`,
                            height: "100%",
                            background: positive
                              ? "#dc2626"
                              : "#2563eb",
                            borderRadius: "20px",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                    marginTop: "20px",
                  }}
                >
                  {explanation.note}
                </p>
              </div>
            )}

            <small>
              This is an educational model output, not a
              medical diagnosis.
            </small>
          </div>
        )}
      </div>
    </div>
  );
}

export default Heart;
