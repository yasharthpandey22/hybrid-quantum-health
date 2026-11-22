import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function Dashboard() {
  const navigate = useNavigate();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();
  const firstName = (user.full_name || user.name || "there").split(" ")[0];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const assessments = [
    {
      title: "Diabetes assessment",
      description: "Explore a model-based estimate using glucose, BMI, age and other health parameters.",
      to: "/diabetes",
      icon: "◉",
      status: "PREDICTION AVAILABLE",
      action: "Start assessment",
    },
    {
      title: "Heart health assessment",
      description: "Review cardiovascular inputs and generate a model-based risk estimate.",
      to: "/heart",
      icon: "♡",
      status: "PREDICTION AVAILABLE",
      action: "Start assessment",
    },
    {
      title: "Chest X-ray workspace",
      description: "Open the image upload interface for the pneumonia research workflow.",
      to: "/pneumonia",
      icon: "▧",
      status: "IMAGE WORKFLOW",
      action: "Open workspace",
    },
  ];

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <span className="page-eyebrow">YOUR WORKSPACE / OVERVIEW</span>
          <h1>Good to see you, {firstName}.</h1>
          <p>Your research workspace for exploring health assessment models and performance.</p>
        </div>
        <button className="page-action" onClick={handleLogout}>↪ Sign out</button>
      </header>

      <section className="dashboard-welcome">
        <div className="dashboard-welcome-copy">
          <span className="welcome-kicker">QUANTUMHEALTH RESEARCH SPACE</span>
          <h2>Turn health data into<br />clearer model insights.</h2>
          <p>
            Choose an assessment to explore model outputs, or review your saved
            results and experimental performance.
          </p>
          <Link to="/history" className="button button-primary button-small" style={{ marginTop: 17 }}>
            View assessment history <span>↗</span>
          </Link>
        </div>
        <div className="dashboard-welcome-art" aria-hidden="true">Q<span style={{ color: "#8b83bd" }}>+</span></div>
      </section>

      <section className="dashboard-summary" aria-label="Workspace summary">
        <div className="summary-tile">
          <span className="summary-icon">⌘</span>
          <div><strong>02</strong><span>Structured prediction workflows</span></div>
        </div>
        <div className="summary-tile">
          <span className="summary-icon">▧</span>
          <div><strong>01</strong><span>Image assessment interface</span></div>
        </div>
        <div className="summary-tile">
          <span className="summary-icon">▥</span>
          <div><strong>Metrics</strong><span>Model evaluation workspace</span></div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <span className="page-eyebrow">ASSESSMENT CENTRE</span>
            <h2>Choose a research workflow</h2>
            <p>Start an assessment or open the image workspace.</p>
          </div>
        </div>

        <div className="disease-grid">
          {assessments.map((item) => (
            <article className="disease-card" key={item.title}>
              <div className="disease-card-top">
                <span className="disease-icon">{item.icon}</span>
                <span className={item.title.includes("Chest") ? "status coming-soon" : "status available"}>
                  <span className="status-dot" style={{ width: 5, height: 5, boxShadow: "none" }} />
                  {item.status}
                </span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link className="disease-btn" to={item.to}>{item.action} <span style={{ marginLeft: 8 }}>↗</span></Link>
            </article>
          ))}
        </div>

        <div className="dashboard-bottom-links">
          <Link to="/history">↗ View prediction history</Link>
          <Link to="/performance">▥ Explore model performance</Link>
        </div>
      </section>

      <div className="dashboard-note">
        <strong>Research-use notice:</strong> QuantumHealth is a student research prototype.
        Model outputs are experimental, are not clinically validated, and must not be used
        as a diagnosis or substitute for professional medical care.
      </div>
    </div>
  );
}

export default Dashboard;
