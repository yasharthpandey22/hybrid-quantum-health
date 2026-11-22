
import { useState } from "react";
import api from "../api/axios";

function Diabetes() {
  const [form, setForm] = useState({
    Pregnancies: 2,
    Glucose: 120,
    BloodPressure: 70,
    SkinThickness: 20,
    Insulin: 80,
    BMI: 25.5,
    DiabetesPedigreeFunction: 0.5,
    Age: 30,
  });

  const [result, setResult] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [message, setMessage] = useState("");
  const [explanationMessage, setExplanationMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setResult(null);
    setExplanation(null);
    setMessage("");
    setExplanationMessage("");

    const patientData = {
      ...form,
      Pregnancies: Number(form.Pregnancies),
      Glucose: Number(form.Glucose),
      BloodPressure: Number(form.BloodPressure),
      SkinThickness: Number(form.SkinThickness),
      Insulin: Number(form.Insulin),
      BMI: Number(form.BMI),
      DiabetesPedigreeFunction: Number(
        form.DiabetesPedigreeFunction
      ),
      Age: Number(form.Age),
    };

    try {
      // First, get the diabetes prediction
      const predictionResponse = await api.post(
        "/api/predict/diabetes",
        patientData
      );

      setResult(predictionResponse.data);

      // SHAP is disabled on the low-memory deployment.
      setExplanationMessage(
        "Prediction completed. Detailed SHAP explanations are temporarily unavailable on this low-memory deployment."
      );
    } catch (error) {
      console.error("Diabetes prediction error:", error);

      setMessage(
        error.response?.data?.detail ||
          "Could not connect to the prediction API."
      );
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    ["Pregnancies", "Pregnancies"],
    ["Glucose", "Glucose"],
    ["BloodPressure", "Blood Pressure"],
    ["SkinThickness", "Skin Thickness"],
    ["Insulin", "Insulin"],
    ["BMI", "BMI"],
    [
      "DiabetesPedigreeFunction",
      "Diabetes Pedigree Function",
    ],
    ["Age", "Age"],
  ];

  const maxContribution =
    explanation?.features?.length > 0
      ? Math.max(
          ...explanation.features.map((item) =>
            Math.abs(item.contribution)
          ),
          0.000001
        )
      : 1;

  return (
    <div className="diabetes-page">
      <header className="page-header">
        <div>
          <span className="page-eyebrow">ASSESSMENT CENTRE / METABOLIC HEALTH</span>
          <h1>Diabetes risk assessment</h1>
          <p>Enter the requested health measurements to explore a model-based estimate.</p>
        </div>
        <span className="page-action">◉ Classical ML model</span>
      </header>

      <section className="assessment-intro">
        <span className="assessment-intro-icon">◉</span>
        <div><strong>Structured health inputs</strong><p>Complete each field using the values from the dataset or assessment scenario.</p></div>
      </section>

      <form className="assessment-form" onSubmit={handleSubmit}>
        {fields.map(([name, label]) => (
          <div className="form-group" key={name}>
            <label htmlFor={name}>{label}</label>

            <input
              className="assessment-input"
              id={name}
              name={name}
              type="number"
              step="any"
              min="0"
              value={form[name]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Generate assessment"} <span>↗</span>
        </button>
      </form>

      {message && (
        <p style={{ color: "#dc2626", marginTop: "16px" }}>
          {message}
        </p>
      )}

      {result && (
        <div
          className="prediction-result"
          style={{
            marginTop: "24px",
            padding: "20px",
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          }}
        >
          <span className="page-eyebrow">ASSESSMENT COMPLETE</span>
          <h2>Prediction result</h2>

          <h3
            style={{
              color:
                result.prediction === 1
                  ? "#dc2626"
                  : "#16a34a",
              marginTop: "12px",
            }}
          >
            {result.prediction === 1
              ? "Higher Diabetes Risk"
              : "Lower Diabetes Risk"}
          </h3>

          <p>
            Estimated probability for Class 1:{" "}
            <strong>
              {result.estimated_probability}%
            </strong>
          </p>

          <p style={{ color: "#64748b", fontSize: "14px" }}>
            This prediction is generated by a student research model for educational purposes. It is not a medical diagnosis.
          </p>
        </div>
      )}

      {explanationMessage && (
        <p style={{ color: "#b45309", marginTop: "16px" }}>
          {explanationMessage}
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
          }}
        >
          <h2>Why did the model make this prediction?</h2>

          <p style={{ color: "#64748b", fontSize: "14px" }}>
            SHAP shows how each feature influenced the model's
            output relative to the reference data.
          </p>

          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              margin: "16px 0",
              fontSize: "13px",
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

          {explanation.features.map((item) => {
            const contribution = item.contribution;
            const isPositive = contribution >= 0;

            const barWidth =
              (Math.abs(contribution) / maxContribution) *
              100;

            return (
              <div
                key={item.feature}
                style={{ marginBottom: "18px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    marginBottom: "6px",
                    fontSize: "14px",
                  }}
                >
                  <strong>{item.feature}</strong>

                  <span
                    style={{
                      color: isPositive
                        ? "#dc2626"
                        : "#2563eb",
                      fontWeight: "600",
                    }}
                  >
                    {contribution > 0 ? "+" : ""}
                    {contribution.toFixed(5)}
                  </span>
                </div>

                <div
                  style={{
                    height: "12px",
                    background: "#e2e8f0",
                    borderRadius: "6px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${barWidth}%`,
                      height: "100%",
                      background: isPositive
                        ? "#dc2626"
                        : "#2563eb",
                      borderRadius: "6px",
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
    </div>
  );
}

export default Diabetes;
