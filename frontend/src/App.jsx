import { useEffect, useState } from "react";
import api from "./api/axios";
import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";
import Dashboard from "./pages/dashboard.jsx";
import Diabetes from "./pages/Diabetes";
import Heart from "./pages/Heart";
import Pneumonia from "./pages/Pneumonia";
import History from "./pages/History";
import ModelPerformance from "./pages/ModelPerformance";

function Home() {

  const [backendStatus, setBackendStatus] = useState("Checking...");

  useEffect(() => {
    api.get("/api/health")
      .then((response) => {
        setBackendStatus(response.data.status);
      })
      .catch(() => {
        setBackendStatus("Connection failed");
      });
  }, []);

  return (
    <div className="app">
      <p>Backend status: {backendStatus}</p>
      <nav className="navbar">
        <h2>QuantumHealth</h2>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <a href="#features">Features</a>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </div>
      </nav>

      <section className="hero" id="home">
        <div>
          <span className="tag">
            Hybrid Quantum + AI Healthcare
          </span>

          <h1>
            Early Disease Detection
            <br />
            <span>Powered by Quantum ML</span>
          </h1>

          <p>
            Combining classical and quantum machine
            learning to explore intelligent disease
            risk assessment.
          </p>

          <Link to="/register">
            <button className="primary-btn">
              Get Started →
            </button>
          </Link>
        </div>

        <div className="hero-card">
          <div className="brain">🧠</div>
          <h2>Hybrid Intelligence</h2>
          <p>Classical ML + Quantum ML</p>
        </div>
      </section>

      <section className="features" id="features">
        <h2>Our Platform Features</h2>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>Disease Prediction</h3>
            <p>
              Analyze health parameters using
              machine learning.
            </p>
          </div>

          <div className="feature-card">
            <h3>Quantum Computing</h3>
            <p>
              Explore quantum circuits for
              classification experiments.
            </p>
          </div>

          <div className="feature-card">
            <h3>Model Comparison</h3>
            <p>
              Compare classical and quantum
              model performance.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/diabetes" element={<Diabetes />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/heart" element={<Heart />} />
      <Route path="/pneumonia" element={<Pneumonia />} />
      <Route path="/history" element={<History />} />
      <Route path="/performance"element={<ModelPerformance />}/>
    </Routes>
  );
}

export default App;
