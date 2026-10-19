import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import { login, logout } from "../../services/authService";

function AdminLogin() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    const fields = new FormData(event.currentTarget);
    setSubmitting(true);
    setMessage("");
    try {
      const user = await login(fields.get("email"), fields.get("password"));
      if (user.role !== "admin") { logout(); setMessage("An administrator account is required."); }
      else { navigate("/admin/dashboard", { replace: true }); }
    } catch (error) { setMessage(error.message); }
    finally { setSubmitting(false); }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <Link className="admin-login-home" to="/" aria-label="Back to JobRecruit home">
          JobRecruit
        </Link>

        <p className="admin-login-eyebrow">ADMIN PORTAL</p>
        <h1 id="admin-login-title">Welcome back</h1>
        <p className="admin-login-intro">Sign in to manage the recruitment platform.</p>

        <div className="admin-login-notice" role="note">
          Administrator accounts must be provisioned privately. Public registration is for Candidates and Recruiters.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-login-field">
            <label htmlFor="admin-email">Email address</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="admin-login-field">
            <label htmlFor="admin-password">Password</label>
            <div className="admin-password-control">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
              />
              <button
                className="admin-password-toggle"
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button className="admin-login-submit" type="submit" disabled={submitting}>{submitting ? "Signing In..." : "Sign In"}</button>
          <p className="admin-login-message" role="status" aria-live="polite">{message}</p>
        </form>
      </section>
    </main>
  );
}

export default AdminLogin;
