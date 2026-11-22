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
  { to: "/performance", label: "Model evaluation", icon: "▥" },
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
            <div className="eyebrow"><span className="eyebrow-dot" /> B.TECH STUDENT RESEARCH PROJECT</div>
            <h1>Hybrid Quantum-Classical Machine Learning for <em>Early Disease Detection</em></h1>
            <p className="landing-lead">
              A student project that combines classical machine learning with quantum
              computing concepts to study disease risk prediction and model performance.
            </p>
            <div className="landing-actions">
              <Link to="/register" className="button button-primary button-large">Create your account <span>↗</span></Link>
              <Link to="/login" className="button button-secondary button-large">Sign in</Link>
            </div>
            <div className="landing-proof">
              <span className="proof-icon">✦</span>
              <span>Academic prototype for learning and experimentation</span>
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
              <h2>Main project modules</h2>
            </div>
            <p>The current prototype includes assessment forms, a hybrid ML research module and model evaluation.</p>
          </div>

          <div className="feature-grid">
            <article className="feature-card feature-card-accent">
              <div className="feature-icon">⌘</div>
              <span className="feature-kicker">01 / ASSESS</span>
              <h3>Disease prediction forms</h3>
              <p>Enter sample health parameters and view predictions from the available machine learning models.</p>
              <Link to="/register">Explore assessments <span>↗</span></Link>
            </article>
            <article className="feature-card">
              <div className="feature-icon feature-icon-violet">⌁</div>
              <span className="feature-kicker">02 / EXPLORE</span>
              <h3>Hybrid ML research</h3>
              <p>Explore the planned combination of classical machine learning and quantum computing methods.</p>
              <a href="#approach">Our approach <span>↗</span></a>
            </article>
            <article className="feature-card">
              <div className="feature-icon feature-icon-blue">▥</div>
              <span className="feature-kicker">03 / EVALUATE</span>
              <h3>Model performance</h3>
              <p>Review test metrics such as accuracy, precision, recall and confusion matrices.</p>
              <Link to="/login">View workspace <span>↗</span></Link>
            </article>
          </div>
        </section>

        <section className="approach-section" id="approach">
          <div className="approach-copy">
            <div className="eyebrow">OUR APPROACH</div>
            <h2>Project overview.<br /><em>Classical and quantum ML.</em></h2>
            <p>
              QuantumHealth is an academic prototype for exploring disease prediction using classical
              machine learning and quantum computing concepts. The current version focuses on
              selected assessment forms, saved predictions and model evaluation.
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
