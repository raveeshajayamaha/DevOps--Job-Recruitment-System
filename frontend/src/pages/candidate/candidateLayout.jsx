import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./dashboard.css";
import "./candidatePages.css";

function CandidateLayout({ title, eyebrow, children }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();

    const trimmed = searchTerm.trim();
    navigate(
      trimmed
        ? `/candidate/jobs?search=${encodeURIComponent(trimmed)}`
        : "/candidate/jobs"
    );
  };

  return (
    <div className="candidate-dashboard candidate-page">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">💼</div>
          <div>
            <h1>JobRecruit</h1>
            <span>Candidate Portal</span>
          </div>
        </div>

        <nav className="sidebar-navigation" aria-label="Candidate navigation">
          <NavLink to="/candidate/dashboard" end className="sidebar-link">
            <span className="nav-icon">⌂</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/candidate/jobs" className="sidebar-link">
            <span className="nav-icon">▣</span>
            <span>Browse Jobs</span>
          </NavLink>
          <NavLink to="/candidate/applications" className="sidebar-link">
            <span className="nav-icon">✓</span>
            <span>My Applications</span>
          </NavLink>
          <NavLink to="/candidate/interviews" className="sidebar-link">
            <span className="nav-icon">◷</span>
            <span>Interviews</span>
          </NavLink>
          <NavLink to="/candidate/profile" className="sidebar-link">
            <span className="nav-icon">◎</span>
            <span>Profile</span>
          </NavLink>
          <NavLink to="/candidate/settings" className="sidebar-link">
            <span className="nav-icon">⚙</span>
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <NavLink to="/" className="sidebar-link logout-link">
            <span className="nav-icon">↪</span>
            <span>Logout</span>
          </NavLink>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="mobile-brand">
            <h2>JobRecruit</h2>
          </div>

          <form className="dashboard-search" onSubmit={handleSearch}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search jobs, companies or keywords..."
              aria-label="Search jobs"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button type="submit">Search</button>
          </form>

          <div className="header-right">
            <button className="notification-button" aria-label="Notifications">
              🔔<span className="notification-badge">3</span>
            </button>
            <button className="message-button" aria-label="Messages">💬</button>
            <button
              className="profile-mini profile-mini-button"
              onClick={() => navigate("/candidate/profile")}
              type="button"
            >
              <div className="profile-avatar">C</div>
              <div className="profile-info">
                <strong>Candidate</strong>
                <span>Job Seeker</span>
              </div>
              <span className="profile-arrow">▾</span>
            </button>
          </div>
        </header>

        <section className="dashboard-content">
          <div className="candidate-page-heading">
            <div>
              <p className="candidate-page-eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
            </div>
            <button
              className="candidate-page-back"
              onClick={() => navigate("/candidate/dashboard")}
              type="button"
            >
              ← Dashboard
            </button>
          </div>
          {children}
        </section>
      </main>
    </div>
  );
}

export default CandidateLayout;
