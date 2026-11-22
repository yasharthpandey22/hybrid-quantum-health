
import { useEffect, useState } from "react";
import api from "../api/axios";
import "./ModelPerformance.css";

// Supports decimal metrics (0.78) and percentage metrics (78.37)
function formatPercentage(value) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "N/A";
  }

  const number = Number(value);
  const percentage = number <= 1 ? number * 100 : number;

  return `${percentage.toFixed(2)}%`;
}

function MetricCard({ title, value }) {
  return (
    <div className="metric-card">
      <p>{title}</p>
      <h2>{formatPercentage(value)}</h2>
    </div>
  );
}

function ConfusionMatrix({ matrix, classNames }) {
  if (!matrix || matrix.length !== 2) {
    return <p>Confusion matrix unavailable.</p>;
  }

  const class0 = classNames?.[0] || "Class 0";
  const class1 = classNames?.[1] || "Class 1";

  return (
    <div className="matrix-wrapper">
      <p className="matrix-caption">
        Rows: Actual class | Columns: Predicted class
      </p>

      <table className="confusion-matrix">
        <thead>
          <tr>
            <th></th>
            <th>Predicted {class0}</th>
            <th>Predicted {class1}</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <th>Actual {class0}</th>
            <td className="matrix-tn">{matrix[0][0]}</td>
            <td className="matrix-fp">{matrix[0][1]}</td>
          </tr>

          <tr>
            <th>Actual {class1}</th>
            <td className="matrix-fn">{matrix[1][0]}</td>
            <td className="matrix-tp">{matrix[1][1]}</td>
          </tr>
        </tbody>
      </table>

      <div className="matrix-legend">
        <span>TN: True Negative</span>
        <span>FP: False Positive</span>
        <span>FN: False Negative</span>
        <span>TP: True Positive</span>
      </div>
    </div>
  );
}

function ModelSection({ name, metrics }) {
  return (
    <section className="model-section">
      <h2>{name}</h2>

      {(metrics.test_images !== undefined ||
        metrics.test_samples !== undefined) && (
        <p className="matrix-caption">
          Test images: {metrics.test_images ?? metrics.test_samples}
        </p>
      )}

      <div className="metrics-grid">
        <MetricCard title="Accuracy" value={metrics.accuracy} />
        <MetricCard title="Precision" value={metrics.precision} />
        <MetricCard title="Recall" value={metrics.recall} />
        <MetricCard title="F1-score" value={metrics.f1_score} />

        {metrics.roc_auc !== undefined &&
          metrics.roc_auc !== null && (
            <MetricCard title="ROC-AUC" value={metrics.roc_auc} />
          )}
      </div>

      <div className="matrix-card">
        <h3>Confusion Matrix</h3>

        <ConfusionMatrix
          matrix={metrics.confusion_matrix}
          classNames={metrics.class_names || ["NORMAL", "PNEUMONIA"]}
        />
      </div>
    </section>
  );
}

function ModelPerformance() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPerformance() {
      try {
        const response = await api.get(
          "/api/predict/performance"
        );

        setMetrics(response.data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Could not load model performance."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPerformance();
  }, []);

  if (loading) {
    return (
      <div className="performance-page">
        <p className="performance-status">
          Loading model performance...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="performance-page">
        <h1>Model Performance</h1>
        <p className="performance-error">{error}</p>
      </div>
    );
  }

  const diabetesMetrics =
    metrics?.Diabetes || metrics?.diabetes;

  const heartMetrics =
    metrics?.["Heart Disease"] || metrics?.heart;

  const pneumoniaMetrics =
    metrics?.Pneumonia || metrics?.pneumonia;

  const pneumoniaV2Metrics =
    metrics?.["Pneumonia V2"] || metrics?.pneumonia_v2;

  return (
    <div className="performance-page">
      <header className="performance-header">
        <div>
          <span className="page-eyebrow">YOUR WORKSPACE / MODEL EVALUATION</span>
          <h1>Model performance</h1>
          <p>Review evaluation metrics from the selected held-out test datasets.</p>
        </div>
      </header>

      {diabetesMetrics && (
        <ModelSection
          name="Diabetes Model"
          metrics={diabetesMetrics}
        />
      )}

      {heartMetrics && (
        <ModelSection
          name="Heart Disease Model"
          metrics={heartMetrics}
        />
      )}

      <div className="pneumonia-comparison">
        <h2>Pneumonia Model Comparison</h2>
        <p>
          Comparison of the original CNN model and the
          improved MobileNetV2 model on the same test dataset.
        </p>

        <div className="pneumonia-comparison-grid">
          {pneumoniaMetrics && (
            <ModelSection
              name="Pneumonia Model (Original)"
              metrics={pneumoniaMetrics}
            />
          )}

          {pneumoniaV2Metrics && (
            <ModelSection
              name="Pneumonia Model V2 (MobileNetV2)"
              metrics={pneumoniaV2Metrics}
            />
          )}
        </div>
      </div>

      <p className="performance-note">
        These results represent model performance on the
        selected test datasets. They do not indicate
        clinical accuracy or provide a medical diagnosis.
      </p>
    </div>
  );
}

export default ModelPerformance;
