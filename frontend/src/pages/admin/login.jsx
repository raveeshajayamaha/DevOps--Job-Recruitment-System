import { useState } from "react";
import { Link } from "react-router-dom";
import "./login.css";

function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("Authentication is not connected yet. No sign-in was performed.");
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
          Real authentication is not connected yet. This form does not sign you in.
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

          <button className="admin-login-submit" type="submit">Sign In</button>
          <p className="admin-login-message" role="status" aria-live="polite">{message}</p>
        </form>
      </section>
    </main>
  );
}

export default AdminLogin;
