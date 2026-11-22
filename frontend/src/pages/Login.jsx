import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";
import "../App.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setMessage(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <aside className="auth-aside">
          <Link to="/" className="brand auth-brand">
            <span className="brand-mark"><span /><span /></span>
            <span className="brand-name">Quantum<span>Health</span></span>
          </Link>
          <div className="auth-aside-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> RESEARCH WORKSPACE</span>
            <h2>Explore the intersection of <em>health and intelligence.</em></h2>
            <p>Sign in to continue to your assessment workspace, review saved results and explore model performance.</p>
          </div>
          <div className="auth-aside-footer">
            <span>CLASSICAL ML</span><i>+</i><span>QUANTUM ML</span>
          </div>
          <div className="auth-aside-orb" aria-hidden="true"><span>Q</span></div>
        </aside>

        <section className="auth-card">
          <Link to="/" className="auth-back">← Back to website</Link>
          <div className="auth-card-heading">
            <span className="auth-card-kicker">WELCOME BACK</span>
            <h1>Sign in to QuantumHealth</h1>
            <p>Use your account details to access your research workspace.</p>
          </div>

          <form onSubmit={handleLogin}>
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button type="submit" className="primary-btn">Sign in <span>↗</span></button>
            {message && <p className="auth-feedback" role="alert">{message}</p>}
          </form>

          <p className="auth-footer">New to QuantumHealth? <Link to="/register">Create an account</Link></p>
          <p className="auth-legal">For educational research use only. Not intended for medical diagnosis.</p>
        </section>
      </div>
    </div>
  );
}

export default Login;
