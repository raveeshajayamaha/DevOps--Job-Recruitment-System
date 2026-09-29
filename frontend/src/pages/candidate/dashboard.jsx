import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./dashboard.css";

import jobs from "../../data/jobs";
import interviews from "../../data/interviews";
import applications from "../../data/applications";
import resources from "../../data/resources";

function Dashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();

    const trimmed = searchTerm.trim();
    const url = trimmed
      ? `/candidate/jobs?search=${encodeURIComponent(trimmed)}`
      : "/candidate/jobs";

    navigate(url);
  };

  const displayedInterviews = interviews.slice(0, 2);
  const displayedApplications = applications.slice(0, 3);
  const displayedResources = resources.slice(0, 2);

  return (
    <div className="candidate-dashboard">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="dashboard-sidebar">

        {/* Logo / Brand */}
        <div className="sidebar-brand">
          <div className="brand-logo">
            💼
          </div>

          <div>
            <h1>JobRecruit</h1>
            <span>Candidate Portal</span>
          </div>
        </div>


        {/* Main Navigation */}
        <nav className="sidebar-navigation">

          <NavLink
            to="/candidate/dashboard"
            end
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            <span className="nav-icon">⌂</span>
            <span>Dashboard</span>
          </NavLink>


          <NavLink
            to="/candidate/jobs"
            className="sidebar-link"
          >
            <span className="nav-icon">▣</span>
            <span>Browse Jobs</span>
          </NavLink>


          <NavLink
            to="/candidate/applications"
            className="sidebar-link"
          >
            <span className="nav-icon">✓</span>
            <span>My Applications</span>
          </NavLink>


          <NavLink
            to="/candidate/interviews"
            className="sidebar-link"
          >
            <span className="nav-icon">◷</span>
            <span>Interviews</span>
          </NavLink>


          <NavLink
            to="/candidate/profile"
            className="sidebar-link"
          >
            <span className="nav-icon">◎</span>
            <span>Profile</span>
          </NavLink>


          <NavLink
            to="/candidate/settings"
            className="sidebar-link"
          >
            <span className="nav-icon">⚙</span>
            <span>Settings</span>
          </NavLink>

        </nav>


        {/* Sidebar Bottom */}
        <div className="sidebar-bottom">

          <NavLink
            to="/"
            className="sidebar-link logout-link"
          >
            <span className="nav-icon">↪</span>
            <span>Logout</span>
          </NavLink>

        </div>

      </aside>


      {/* =====================================================
          MAIN DASHBOARD AREA
      ====================================================== */}

      <main className="dashboard-main">


        {/* =================================================
            TOP HEADER
        ================================================== */}

        <header className="dashboard-header">

          {/* Mobile / Small Screen Brand */}
          <div className="mobile-brand">
            <h2>JobRecruit</h2>
          </div>


          {/* Search Bar */}
          <form className="dashboard-search" onSubmit={handleSearch}>

            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search jobs, companies or keywords..."
              aria-label="Search jobs"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <button type="submit">
              Search
            </button>

          </form>


          {/* Header Right */}
          <div className="header-right">

            {/* Notification */}
            <button
              className="notification-button"
              aria-label="Notifications"
            >
              🔔
              <span className="notification-badge">
                3
              </span>
            </button>


            {/* Messages */}
            <button
              className="message-button"
              aria-label="Messages"
            >
              💬
            </button>


            {/* Candidate Profile */}
            <div className="profile-mini">

              <div className="profile-avatar">
                C
              </div>

              <div className="profile-info">

                <strong>
                  Candidate
                </strong>

                <span>
                  Job Seeker
                </span>

              </div>

              <span className="profile-arrow">
                ▾
              </span>

            </div>

          </div>

        </header>


        {/* =================================================
            DASHBOARD CONTENT
        ================================================== */}

        <section className="dashboard-content">


          {/* =================================================
              MAIN + RIGHT COLUMN
          ================================================== */}

          <div className="dashboard-grid">


            {/* =================================================
                LEFT / MAIN COLUMN
            ================================================== */}

            <div className="dashboard-primary">


              {/* =============================================
                  WELCOME / HERO SECTION
              ============================================== */}

              <section
                className="welcome-section"
                style={{
                  backgroundImage: "linear-gradient(135deg, rgba(25, 77, 181, 0.92), rgba(31, 59, 138, 0.82)), url('/background/bg3.jpg')"
                }}
              >

                <div className="welcome-content">

                  <p className="welcome-label">
                    Candidate Dashboard
                  </p>

                  <h1>
                    Find Your Dream Job
                  </h1>

                  <p className="welcome-description">
                    Build your career with exciting
                    opportunities from top companies.
                  </p>

                  <NavLink
                    to="/candidate/jobs"
                    className="browse-jobs-button"
                  >
                    Explore Jobs →
                  </NavLink>

                </div>

              </section>


              {/* =============================================
                  STATISTICS
              ============================================== */}

              <section className="stats-grid">


                {/* Applied Jobs */}
                <div className="stat-card">

                  <div className="stat-icon jobs-icon">
                    📄
                  </div>

                  <div className="stat-content">

                    <strong>
                      12
                    </strong>

                    <span>
                      Applied Jobs
                    </span>

                  </div>

                  <span className="stat-arrow">
                    →
                  </span>

                </div>


                {/* Saved Jobs */}
                <div className="stat-card">

                  <div className="stat-icon applications-icon">
                    🔖
                  </div>

                  <div className="stat-content">

                    <strong>
                      8
                    </strong>

                    <span>
                      Saved Jobs
                    </span>

                  </div>

                  <span className="stat-arrow">
                    →
                  </span>

                </div>


                {/* Interviews */}
                <div className="stat-card">

                  <div className="stat-icon interviews-icon">
                    👥
                  </div>

                  <div className="stat-content">

                    <strong>
                      3
                    </strong>

                    <span>
                      Interviews
                    </span>

                  </div>

                  <span className="stat-arrow">
                    →
                  </span>

                </div>


                {/* Profile Views */}
                <div className="stat-card">

                  <div className="stat-icon views-icon">
                    👁
                  </div>

                  <div className="stat-content">

                    <strong>
                      250
                    </strong>

                    <span>
                      Profile Views
                    </span>

                  </div>

                  <span className="stat-arrow">
                    →
                  </span>

                </div>

              </section>


              {/* =============================================
                  RECOMMENDED JOBS
              ============================================== */}

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
                    View All →
                  </NavLink>

                </div>


                {/* Dynamic Job Cards */}

                <div className="recommended-jobs">

                  {jobs.slice(0, 3).map((job, index) => (

                    <div
                      className="job-card"
                      key={job.id ?? index}
                    >


                      {/* Company Logo */}

                      <div className="company-logo">

                        {job.company?.charAt(0) ||
                          job.title?.charAt(0)}

                      </div>


                      {/* Job Information */}

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


                      {/* View Job */}

                      <NavLink
                        to={`/candidate/jobs/${job.id ?? index + 1}`}
                        className="job-view-button"
                      >
                        View Job
                      </NavLink>

                    </div>

                  ))}

                </div>

              </section>


              {/* =============================================
                  PROFILE COMPLETION
              ============================================== */}

              <section className="profile-card">

                <div className="profile-card-content">

                  <div>

                    <span className="profile-label">
                      PROFILE COMPLETION
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

            </div>


            {/* =================================================
                RIGHT SIDEBAR
            ================================================== */}

            <aside className="dashboard-right">


              {/* =============================================
                  UPCOMING INTERVIEWS
              ============================================== */}

              <section className="dashboard-side-card">

                <div className="side-card-header">

                  <h2>
                    Upcoming Interviews
                  </h2>

                  <NavLink
                    to="/candidate/interviews"
                  >
                    View All →
                  </NavLink>

                </div>

                {displayedInterviews.map((interview) => (
                  <NavLink
                    key={interview.id}
                    to="/candidate/interviews"
                    className="interview-item"
                  >
                    <div className="interview-icon">
                      {interview.type === "Technical" ? "🎥" : interview.type === "HR" ? "👥" : "🧩"}
                    </div>

                    <div className="interview-info">
                      <strong>{interview.title}</strong>
                      <span>{interview.company}</span>
                      <small>
                        📅 {interview.date} &nbsp; 🕐 {interview.time}
                      </small>
                    </div>

                    <span className="item-arrow">→</span>
                  </NavLink>
                ))}

              </section>


              {/* =============================================
                  RECENT APPLICATIONS
              ============================================== */}

              <section className="dashboard-side-card">

                <div className="side-card-header">

                  <h2>
                    Recent Applications
                  </h2>

                  <NavLink
                    to="/candidate/applications"
                  >
                    View All →
                  </NavLink>

                </div>

                {displayedApplications.map((application) => {
                  const logoInitial = application.company.charAt(0).toUpperCase();
                  const statusClass = (
                    application.status === "Applied"
                      ? "applied"
                      : application.status === "Under Review"
                        ? "review"
                        : "shortlisted"
                  );

                  return (
                    <NavLink
                      key={application.id}
                      to="/candidate/applications"
                      className="application-item"
                    >
                      <div className="application-logo">
                        {logoInitial}
                      </div>

                      <div className="application-info">
                        <strong>{application.jobTitle}</strong>
                        <span>{application.company}</span>
                      </div>

                      <div className="application-status">
                        <span className={`status ${statusClass}`}>
                          {application.status}
                        </span>
                        <small>{application.appliedDate}</small>
                      </div>
                    </NavLink>
                  );
                })}

              </section>


              {/* =============================================
                  CAREER RESOURCES
              ============================================== */}

              <section className="dashboard-side-card">

                <div className="side-card-header">

                  <h2>
                    Career Resources
                  </h2>

                  <NavLink
                    to="/candidate/resources"
                  >
                    View All →
                  </NavLink>

                </div>

                {displayedResources.map((resource) => (
                  <NavLink
                    key={resource.id}
                    to={resource.route}
                    className="resource-item"
                  >
                    <div className={`resource-icon ${resource.category === "resume" ? "resume-icon" : "tips-icon"}`}>
                      {resource.category === "resume" ? "📄" : "💡"}
                    </div>

                    <div>
                      <strong>{resource.title}</strong>
                      <span>{resource.description}</span>
                    </div>
                  </NavLink>
                ))}

              </section>

            </aside>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;