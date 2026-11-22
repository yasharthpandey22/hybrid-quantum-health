import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";
import api from "./api/axios";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard.jsx";
import Diabetes from "./pages/Diabetes.jsx";
import Heart from "./pages/Heart.jsx";
import Pneumonia from "./pages/Pneumonia.jsx";
import History from "./pages/History.jsx";
import ModelPerformance from "./pages/ModelPerformance.jsx";
import "./App.css";

const workspaceLinks = [
  { to: "/dashboard", label: "Overview", icon: "⌂" },
  { to: "/diabetes", label: "Diabetes", icon: "◉" },
  { to: "/heart", label: "Heart health", icon: "♡" },
  { to: "/pneumonia", label: "Chest X-ray", icon: "▧" },
  { to: "/history", label: "Assessment history", icon: "↗" },
  { to: "/performance", label: "Model performance", icon: "▥" },
];

function Brand({ compact = false }) {
  return (
    <Link to="/" className={`brand ${compact ? "brand-compact" : ""}`}>
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
      </span>
      <span className="brand-name">
        Quantum<span>Health</span>
      </span>
    </Link>
  );
}

function Home() {
  const [backendStatus, setBackendStatus] = useState("Checking service");

  useEffect(() => {
    let active = true;
    api.get("/api/health")
      .then((response) => {
        if (active) setBackendStatus(response.data.status === "healthy" ? "All systems operational" : "Service responding");
      })
      .catch(() => {
        if (active) setBackendStatus("Service may be waking up");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="landing-page">
      <header className="site-nav">
        <div className="site-nav-inner">
          <Brand />
          <nav className="site-nav-links" aria-label="Main navigation">
            <a href="#platform">Platform</a>
            <a href="#approach">Our approach</a>
            <Link to="/login" className="nav-login">Log in</Link>
            <Link to="/register" className="button button-primary button-small">Get started <span>↗</span></Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> HYBRID QUANTUM + CLASSICAL AI</div>
            <h1>Explore a smarter approach to <em>early health insights.</em></h1>
            <p className="landing-lead">
              A research platform combining classical machine learning and quantum computing
              concepts to explore data-driven disease risk assessment.
            </p>
            <div className="landing-actions">
              <Link to="/register" className="button button-primary button-large">Create your account <span>↗</span></Link>
              <Link to="/login" className="button button-secondary button-large">Sign in</Link>
            </div>
            <div className="landing-proof">
              <span className="proof-icon">✦</span>
              <span>Built for transparent experimentation and model comparison</span>
            </div>
          </div>

          <div className="landing-visual" aria-label="Illustration of a health analytics dashboard">
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />
            <div className="visual-glow" />
            <div className="visual-card visual-card-top">
              <span className="visual-card-label">PLATFORM STATUS</span>
              <span className="status-line"><span className="status-dot" /> Research workspace</span>
            </div>
            <div className="visual-core">
              <div className="core-ring ring-outer" />
              <div className="core-ring ring-inner" />
              <div className="core-symbol">Q<span>+</span></div>
              <div className="core-caption">HYBRID INTELLIGENCE</div>
            </div>
            <div className="visual-card visual-card-bottom">
              <div>
                <span className="visual-card-label">MODEL WORKFLOW</span>
                <strong>Classical <i>+</i> Quantum</strong>
              </div>
              <span className="workflow-arrow">↗</span>
            </div>
            <span className="visual-orbit-dot dot-a" />
            <span className="visual-orbit-dot dot-b" />
          </div>
        </section>

        <section className="landing-stats" aria-label="Platform highlights">
          <div><strong>03</strong><span>Research assessment areas</span></div>
          <div><strong>ML + QML</strong><span>Hybrid research approach</span></div>
          <div><strong>One place</strong><span>Experiments and model insights</span></div>
          <div className="service-status"><span className="status-dot" /><span>{backendStatus}</span></div>
        </section>

        <section className="landing-section" id="platform">
          <div className="section-heading">
            <div>
              <div className="eyebrow">THE PLATFORM</div>
              <h2>Research workflows, <em>made clearer.</em></h2>
            </div>
            <p>Move from structured health inputs to model outputs and evaluation metrics in one workspace.</p>
          </div>

          <div className="feature-grid">
            <article className="feature-card feature-card-accent">
              <div className="feature-icon">⌘</div>
              <span className="feature-kicker">01 / ASSESS</span>
              <h3>Health risk assessment</h3>
              <p>Explore model-based predictions through structured diabetes and cardiovascular input forms.</p>
              <Link to="/register">Explore assessments <span>↗</span></Link>
            </article>
            <article className="feature-card">
              <div className="feature-icon feature-icon-violet">⌁</div>
              <span className="feature-kicker">02 / EXPLORE</span>
              <h3>Hybrid computing</h3>
              <p>Bring classical machine learning and quantum machine learning research into a shared workflow.</p>
              <a href="#approach">Our approach <span>↗</span></a>
            </article>
            <article className="feature-card">
              <div className="feature-icon feature-icon-blue">▥</div>
              <span className="feature-kicker">03 / EVALUATE</span>
              <h3>Model performance</h3>
              <p>Review evaluation metrics and compare how experimental models perform on their test datasets.</p>
              <Link to="/login">View workspace <span>↗</span></Link>
            </article>
          </div>
        </section>

        <section className="approach-section" id="approach">
          <div className="approach-copy">
            <div className="eyebrow">OUR APPROACH</div>
            <h2>Classical foundations.<br /><em>Quantum exploration.</em></h2>
            <p>
              QuantumHealth is a student research prototype exploring how classical data
              processing and quantum-enhanced classification can be brought together.
              It is designed for learning, experimentation and model evaluation.
            </p>
            <Link to="/register" className="text-link">Enter the research workspace <span>↗</span></Link>
          </div>
          <div className="approach-steps">
            <div className="approach-step"><span>01</span><div><strong>Prepare</strong><p>Structure and process model inputs.</p></div></div>
            <div className="approach-step"><span>02</span><div><strong>Predict</strong><p>Run supported classical ML assessments.</p></div></div>
            <div className="approach-step"><span>03</span><div><strong>Evaluate</strong><p>Review metrics and compare experiments.</p></div></div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <Brand compact />
        <p>© {new Date().getFullYear()} QuantumHealth · Student research prototype</p>
        <span>Not a medical diagnosis or substitute for professional care.</span>
      </footer>
    </div>
  );
}

function WorkspaceShell({ children }) {
  const navigate = useNavigate();
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();
  const initials = (user.full_name || user.name || "QH")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <Brand />
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="workspace-nav" aria-label="Workspace navigation">
          {workspaceLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `workspace-nav-link ${isActive ? "active" : ""}`}
            >
              <span className="workspace-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.to === "/pneumonia" && <span className="nav-subtle-dot" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="sidebar-note-icon">✦</span>
            <strong>Research workspace</strong>
            <p>Explore model outputs and experimental performance.</p>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <span>↪</span> Sign out
          </button>
        </div>
      </aside>

      <div className="workspace-main">
        <header className="workspace-topbar">
          <div className="breadcrumb"><span>QuantumHealth</span><b>/</b><strong>Workspace</strong></div>
          <div className="topbar-user">
            <div className="topbar-user-copy">
              <span>Signed in as</span>
              <strong>{user.full_name || user.name || "Research user"}</strong>
            </div>
            <div className="user-avatar">{initials || "QH"}</div>
          </div>
        </header>
        <main className="workspace-content">{children}</main>
      </div>
    </div>
  );
}

function WorkspaceRoute({ children }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<WorkspaceRoute><Dashboard /></WorkspaceRoute>} />
      <Route path="/diabetes" element={<WorkspaceRoute><Diabetes /></WorkspaceRoute>} />
      <Route path="/heart" element={<WorkspaceRoute><Heart /></WorkspaceRoute>} />
      <Route path="/pneumonia" element={<WorkspaceRoute><Pneumonia /></WorkspaceRoute>} />
      <Route path="/history" element={<WorkspaceRoute><History /></WorkspaceRoute>} />
      <Route path="/performance" element={<WorkspaceRoute><ModelPerformance /></WorkspaceRoute>} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;
