import { NavLink } from "react-router-dom";
import "./dashboard.css";

import jobs from "../../data/jobs";

function Dashboard() {
  return (
    <div className="candidate-dashboard">

      {/* =========================
          Sidebar
      ========================= */}

      <aside className="dashboard-sidebar">

        <div className="sidebar-brand">
          <h1>JobRecruit</h1>
          <span>Candidate Portal</span>
        </div>

        {/* Navigation */}

        <nav className="sidebar-navigation">

          <NavLink
            to="/candidate/dashboard"
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            <span className="nav-icon">⌂</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/candidate/jobs"
            className="sidebar-link"
          >
            <span className="nav-icon">▣</span>
            Find Jobs
          </NavLink>

          <NavLink
            to="/candidate/applications"
            className="sidebar-link"
          >
            <span className="nav-icon">✓</span>
            My Applications
          </NavLink>

          <NavLink
            to="/candidate/interviews"
            className="sidebar-link"
          >
            <span className="nav-icon">◷</span>
            Interviews
          </NavLink>

          <NavLink
            to="/candidate/profile"
            className="sidebar-link"
          >
            <span className="nav-icon">◎</span>
            My Profile
          </NavLink>

        </nav>

        {/* Sidebar Bottom */}

        <div className="sidebar-bottom">

          <NavLink
            to="/"
            className="sidebar-link logout-link"
          >
            <span className="nav-icon">↪</span>
            Logout
          </NavLink>

        </div>

      </aside>


      {/* =========================
          Main Content
      ========================= */}

      <main className="dashboard-main">

        {/* Top Header */}

        <header className="dashboard-header">

          <div className="mobile-brand">
            <h2>JobRecruit</h2>
          </div>

          <div className="header-right">

            <button className="notification-button">
              ♢
              <span className="notification-dot"></span>
            </button>

            <div className="profile-mini">

              <div className="profile-avatar">
                C
              </div>

              <div className="profile-info">
                <strong>Candidate</strong>
                <span>Job Seeker</span>
              </div>

            </div>

          </div>

        </header>


        {/* =========================
            Dashboard Content
        ========================= */}

        <section className="dashboard-content">


          {/* Welcome Section */}

          <div className="welcome-section">

            <div>

              <p className="welcome-label">
                Candidate Dashboard
              </p>

              <h1>
                Welcome back! 👋
              </h1>

              <p>
                Find your next career opportunity and
                manage your applications.
              </p>

            </div>

            <NavLink
              to="/candidate/jobs"
              className="browse-jobs-button"
            >
              Browse Jobs →
            </NavLink>

          </div>


          {/* =========================
              Statistics
          ========================= */}

          <div className="stats-grid">

            <div className="stat-card">

              <div className="stat-icon jobs-icon">
                ◈
              </div>

              <div>
                <span>Available Jobs</span>

                <strong>
                  {jobs.length}
                </strong>
              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon applications-icon">
                ✓
              </div>

              <div>
                <span>Applications</span>

                <strong>5</strong>
              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon interviews-icon">
                ◷
              </div>

              <div>
                <span>Upcoming Interviews</span>

                <strong>2</strong>
              </div>

            </div>

          </div>


          {/* =========================
              Recommended Jobs
          ========================= */}

          <section className="jobs-section">

            <div className="section-header">

              <div>

                <h2>
                  Recommended Jobs
                </h2>

                <p>
                  Opportunities that may match your profile
                </p>

              </div>

              <NavLink
                to="/candidate/jobs"
                className="view-all-link"
              >
                View all
              </NavLink>

            </div>


            {/* Dynamic Job Cards */}

            {jobs.slice(0, 3).map((job, index) => (

              <div
                className="job-card"
                key={job.id ?? index}
              >

                {/* Company Logo */}

                <div className="company-logo">
                  {job.company?.charAt(0) || job.title?.charAt(0)}
                </div>


                {/* Job Details */}

                <div className="job-details">

                  <h3>
                    {job.title}
                  </h3>

                  <p className="company-name">
                    {job.company}
                  </p>

                  <div className="job-meta">

                    <span>
                      📍 {job.location}
                    </span>

                    <span>
                      💼 {job.type}
                    </span>

                    <span>
                      💰 {job.salary}
                    </span>

                  </div>

                </div>


                {/* Dynamic View Job Button */}

                <NavLink
                  to={`/candidate/jobs/${job.id ?? index + 1}`}
                  className="job-view-button"
                >
                  View Job
                </NavLink>

              </div>

            ))}

          </section>


          {/* =========================
              Profile Completion
          ========================= */}

          <section className="profile-card">

            <div className="profile-card-content">

              <div>

                <span className="profile-label">
                  Profile Completion
                </span>

                <h2>
                  Complete your profile
                </h2>

                <p>
                  Add your skills, experience and CV
                  to improve your job opportunities.
                </p>

              </div>

              <NavLink
                to="/candidate/profile"
                className="profile-button"
              >
                Complete Profile
              </NavLink>

            </div>


            <div className="progress-area">

              <div className="progress-header">

                <span>
                  Profile progress
                </span>

                <strong>
                  65%
                </strong>

              </div>

              <div className="progress-bar">

                <div
                  className="progress-value"
                  style={{ width: "65%" }}
                ></div>

              </div>

            </div>

          </section>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;