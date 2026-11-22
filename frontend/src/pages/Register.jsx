import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";
import "../App.css";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await api.post("/api/auth/register", {
        full_name: fullName,
        email,
        password,
      });

      const loginResponse = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", loginResponse.data.access_token);
      localStorage.setItem("user", JSON.stringify(loginResponse.data.user));
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setMessage(detail.map((item) => item.msg).join(", "));
      } else if (typeof detail === "object" && detail !== null) {
        setMessage(detail.msg || JSON.stringify(detail));
      } else {
        setMessage(
          detail ||
          error.response?.data?.message ||
          error.message ||
          "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
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
            <span className="eyebrow"><span className="eyebrow-dot" /> YOUR RESEARCH SPACE</span>
            <h2>A clearer space to <em>explore model insights.</em></h2>
            <p>Create an account to access health assessment workflows, track previous results and review experimental model performance.</p>
          </div>
          <div className="auth-aside-footer">
            <span>ASSESS</span><i>→</i><span>EXPLORE</span><i>→</i><span>EVALUATE</span>
          </div>
          <div className="auth-aside-orb" aria-hidden="true"><span>Q</span></div>
        </aside>

        <section className="auth-card">
          <Link to="/" className="auth-back">← Back to website</Link>
          <div className="auth-card-heading">
            <span className="auth-card-kicker">GET STARTED</span>
            <h1>Create your account</h1>
            <p>Set up your QuantumHealth research workspace.</p>
          </div>

          <form onSubmit={handleRegister}>
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />

            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Creating your account..." : "Create account"} <span>↗</span>
            </button>
            {message && <p className="auth-feedback" role="alert">{message}</p>}
          </form>

          <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
          <p className="auth-legal">For educational research use only. Not intended for medical diagnosis.</p>
        </section>
      </div>
    </div>
  );
}

export default Register;
