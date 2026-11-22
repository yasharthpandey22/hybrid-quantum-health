import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function Pneumonia() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    setResult(null);
    setError("");

    if (!selectedFile) {
      setFile(null);
      setPreview("");
      return;
    }

    if (!["image/jpeg", "image/png", "image/jpg"].includes(selectedFile.type)) {
      setError("Please select a JPG or PNG image.");
      setFile(null);
      setPreview("");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Please select a chest X-ray image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(
        "/api/predict/pneumonia",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.status === 503
          ? "Pneumonia analysis is currently unavailable. Please try again later."
          : err.response?.data?.detail ||
            "Unable to analyze the X-ray. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const isPneumonia = result?.prediction === 1;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "32px 20px",
        fontFamily: "Arial, sans-serif",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          maxWidth: "850px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <Link
            to="/dashboard"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            ← Back to Dashboard
          </Link>

          <h1
            style={{
              fontSize: "32px",
              marginTop: "20px",
              marginBottom: "8px",
            }}
          >
            Pneumonia Assessment
          </h1>

          <p style={{ color: "#64748b", fontSize: "16px" }}>
            Upload a chest X-ray image to estimate pneumonia risk.
          </p>
        </div>


        {/* Upload Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "28px",
            boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="xray"
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "12px",
                fontSize: "16px",
              }}
            >
              Chest X-ray Image
            </label>

            <input
              id="xray"
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFileChange}
              style={{
                display: "block",
                width: "100%",
                padding: "14px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                background: "#f8fafc",
                boxSizing: "border-box",
              }}
            />

            <p
              style={{
                color: "#64748b",
                fontSize: "14px",
                marginTop: "10px",
              }}
            >
              Supported formats: JPG and PNG
            </p>

            {/* Image Preview */}
            {preview && (
              <div style={{ marginTop: "24px" }}>
                <h3 style={{ marginBottom: "12px" }}>Image Preview</h3>

                <img
                  src={preview}
                  alt="Selected chest X-ray"
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    maxHeight: "350px",
                    objectFit: "contain",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    background: "#0f172a",
                  }}
                />
              </div>
            )}

            {/* Analyze Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "24px",
                width: "100%",
                padding: "14px",
                background: loading ? "#94a3b8" : "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Analyzing X-ray..." : "Analyze X-ray"}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div
              style={{
                marginTop: "20px",
                padding: "14px",
                background: "#fee2e2",
                color: "#991b1b",
                borderRadius: "10px",
              }}
            >
              {error}
            </div>
          )}

          {/* Prediction Result */}
          {result && (
            <div
              style={{
                marginTop: "24px",
                padding: "24px",
                borderRadius: "14px",
                background: isPneumonia ? "#fff1f2" : "#ecfdf5",
                border: `1px solid ${
                  isPneumonia ? "#fecdd3" : "#a7f3d0"
                }`,
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  color: isPneumonia ? "#be123c" : "#047857",
                }}
              >
                {isPneumonia
                  ? "Pneumonia-like Pattern Detected"
                  : "Normal X-ray Pattern Predicted"}
              </h2>

              <p style={{ fontSize: "18px", fontWeight: "600" }}>
                Estimated model probability:{" "}
                {result.estimated_probability}%
              </p>

              <p style={{ color: "#475569" }}>{result.message}</p>

              <p
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  marginBottom: 0,
                }}
              >
                This is an educational model prediction, not a medical
                diagnosis. Please consult a qualified healthcare professional
                for medical interpretation.
              </p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div
          style={{
            marginTop: "24px",
            padding: "18px",
            background: "#e0f2fe",
            color: "#075985",
            borderRadius: "12px",
            lineHeight: "1.6",
          }}
        >
          <strong>Note:</strong> QuantumHealth is a student research prototype
          for educational purposes. It does not provide a medical diagnosis.
        </div>
      </div>
    </div>
  );
}

export default Pneumonia;