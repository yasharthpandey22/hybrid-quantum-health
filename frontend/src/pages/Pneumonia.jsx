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

      const response = await api.post("/api/predict/pneumonia", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.status === 503
          ? "Pneumonia analysis is currently unavailable. Please try again later."
          : err.response?.data?.detail || "Unable to analyze the X-ray. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const isPneumonia = result?.prediction === 1;

  return (
    <div className="pneumonia-page">
      <header className="page-header">
        <div>
          <span className="page-eyebrow">ASSESSMENT CENTRE / IMAGE WORKFLOW</span>
          <h1>Chest X-ray workspace</h1>
          <p className="page-intro">Upload a chest X-ray image to explore the pneumonia research workflow.</p>
        </div>
        <Link to="/dashboard" className="page-action">← Back to overview</Link>
      </header>

      <section className="pneumonia-upload-card">
        <div className="upload-heading">
          <span className="upload-heading-icon">▧</span>
          <div>
            <h2>Upload an X-ray image</h2>
            <p>Select a clear JPG or PNG image from your device.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="xray">Chest X-ray image</label>
          <input
            id="xray"
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleFileChange}
          />
          <p className="upload-help">Supported formats: JPG and PNG</p>

          {preview && (
            <div className="pneumonia-preview">
              <div className="preview-label">IMAGE PREVIEW</div>
              <img src={preview} alt="Selected chest X-ray" />
              <p>{file?.name}</p>
            </div>
          )}

          <button type="submit" className="pneumonia-submit" disabled={loading}>
            {loading ? "Analyzing X-ray..." : "Analyze X-ray"} <span>↗</span>
          </button>
        </form>

        {error && <div className="pneumonia-error" role="alert">{error}</div>}

        {result && (
          <div className={`pneumonia-result ${isPneumonia ? "is-positive" : ""}`}>
            <span className="page-eyebrow">MODEL OUTPUT</span>
            <h2>{isPneumonia ? "Pneumonia-like pattern detected" : "Normal X-ray pattern predicted"}</h2>
            <p>Estimated model probability: <strong>{result.estimated_probability}%</strong></p>
            <p>{result.message}</p>
            <small>This is an educational model prediction, not a medical diagnosis.</small>
          </div>
        )}
      </section>

      <div className="pneumonia-disclaimer">
        <strong>Research-use notice:</strong> QuantumHealth is a student research prototype
        for educational purposes. It does not provide a medical diagnosis. Please consult
        a qualified healthcare professional for medical interpretation.
      </div>
    </div>
  );
}

export default Pneumonia;
