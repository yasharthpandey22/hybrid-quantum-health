import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/api/predict/history");
        setHistory(response.data);
      } catch (err) {
        console.error("History error:", err);
        if (err.response?.status === 401) {
          setError("Please log in again to view your prediction history.");
        } else {
          setError("Could not load prediction history.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";
    return new Date(date).toLocaleString();
  };

  return (
    <div className="history-page">
      <header className="page-header">
        <div>
          <span className="page-eyebrow">YOUR WORKSPACE / ACTIVITY</span>
          <h1>Assessment history</h1>
          <p>Review results saved from your previous research assessments.</p>
        </div>
        <Link to="/dashboard" className="page-action">← Back to overview</Link>
      </header>

      {loading && <div className="page-state-card">Loading your assessment history…</div>}

      {error && (
        <div className="pneumonia-error">
          {error}
          {error.includes("log in") && <div style={{ marginTop: 10 }}><Link to="/login">Go to login</Link></div>}
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">↗</div>
          <h3>No saved assessments yet</h3>
          <p>Your completed prediction results will appear here.</p>
          <Link to="/dashboard" className="button button-primary button-small">Explore assessments <span>↗</span></Link>
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <div className="history-list">
          {history.map((item) => (
            <article className="history-item" key={item.id}>
              <div className="history-item-top">
                <div>
                  <span className="page-eyebrow">{item.disease} ASSESSMENT</span>
                  <h3>{item.message}</h3>
                </div>
                <span className={`history-outcome ${item.prediction === 1 ? "positive" : ""}`}>
                  {item.prediction === 1 ? "Positive model result" : "Negative model result"}
                </span>
              </div>
              <div className="history-item-meta">
                <p>Estimated probability <strong>{item.estimated_probability}%</strong></p>
                <p>{formatDate(item.created_at)}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="history-disclaimer">
        Educational research prototype only. These model results are not a medical diagnosis.
      </p>
    </div>
  );
}

export default History;
