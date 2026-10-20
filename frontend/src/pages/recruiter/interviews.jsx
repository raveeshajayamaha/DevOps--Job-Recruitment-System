import { logout } from "../../services/authService";
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { getInterviews } from "../../services/interviewService";
import "./dashboard.css";
import "./interviews.css";

const sidebarItems = [
  { label: "Dashboard", icon: "⌂", to: "/recruiter/dashboard", end: true },
  { label: "Post Job", icon: "+", to: "/recruiter/jobs/new", end: true },
  { label: "Manage Jobs", icon: "▣", to: "/recruiter/jobs", end: true },
  { label: "Applications", icon: "✓", to: "/recruiter/applications" },
  { label: "Interviews", icon: "◷", to: "/recruiter/interviews", end: true },
  { label: "Profile", icon: "◎", to: "/recruiter/profile" },
  { label: "Settings", icon: "⚙", to: "/recruiter/settings" },
];

function RecruiterInterviews() {
  const [result, setResult] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    getInterviews(controller.signal).then(interviews => setResult({ interviews }))
      .catch(error => { if (!controller.signal.aborted) setResult({ error }); });
    return () => controller.abort();
  }, []);
  const interviews = useMemo(() => result?.interviews || [], [result]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const filteredInterviews = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return interviews.filter((interview) => {
      const matchesSearch = [
        interview.candidateName,
        interview.candidateEmail,
        interview.jobTitle,
      ].some((field) => field.toLowerCase().includes(normalizedSearch));
      const matchesStatus = statusFilter === "all" || interview.status === statusFilter;
      const matchesType = typeFilter === "all" || interview.interviewType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [interviews, searchTerm, statusFilter, typeFilter]);

  return (
    <RecruiterLayout>
      <section className="recruiter-card interviews-card">
        <div className="interviews-toolbar">
          <div>
            <h2>Scheduled interviews</h2>
            <p>Keep track of candidate interviews and hiring progress.</p>
          </div>
          <span className="applications-count">{filteredInterviews.length} interviews</span>
        </div>
        <div className="interviews-filters">
          <label>
            <span>Search interviews</span>
            <input aria-label="Search interviews" onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search candidate or job..." type="search" value={searchTerm} />
          </label>
          <label>
            <span>Status</span>
            <select aria-label="Filter interviews by status" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label>
            <span>Interview type</span>
            <select aria-label="Filter interviews by type" onChange={(event) => setTypeFilter(event.target.value)} value={typeFilter}>
              <option value="all">All Types</option>
              <option value="Video Call">Video Call</option>
              <option value="Phone Call">Phone Call</option>
              <option value="In-person">In-person</option>
            </select>
          </label>
        </div>
        {!result ? <p role="status">Loading interviews...</p> : result.error ? <p role="alert">{result.error.message}</p> : filteredInterviews.length > 0 ? (
          <div className="interviews-list">
            {filteredInterviews.map((interview) => (
              <article className="interview-row" key={interview.id}>
                <div className="candidate-avatar">{getInitials(interview.candidateName)}</div>
                <div className="interview-person">
                  <strong>{interview.candidateName}</strong>
                  <span>{interview.candidateEmail}</span>
                </div>
                <div className="interview-job">
                  <strong>{interview.jobTitle}</strong>
                  <span>{interview.company}</span>
                </div>
                <div className="interview-schedule">
                  <strong>{formatDate(interview.interviewDate)}</strong>
                  <span>{formatTime(interview.interviewTime)} · {interview.interviewType}</span>
                </div>
                <div className="interview-row-action">
                  <span className={`recruiter-status ${interview.status}`}>{formatStatus(interview.status)}</span>
                  <NavLink className="recruiter-text-button" to={`/recruiter/interviews/${interview.id}`}>View Details →</NavLink>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="applications-empty" role="status">
            <strong>No interviews found</strong>
            <span>Try adjusting your search or filters.</span>
          </div>
        )}
      </section>
    </RecruiterLayout>
  );
}

function RecruiterLayout({ children }) {
  return (
    <div className="recruiter-dashboard recruiter-interviews-page">
      <RecruiterSidebar />
      <main className="recruiter-main">
        <header className="recruiter-header">
          <div><p className="recruiter-eyebrow">RECRUITER WORKSPACE</p><h1>Interviews</h1><p className="recruiter-header-description">Schedule and manage candidate interviews.</p></div>
          <HeaderActions />
        </header>
        <div className="recruiter-content">{children}</div>
      </main>
    </div>
  );
}

function RecruiterSidebar() {
  return <aside className="recruiter-sidebar"><div className="recruiter-brand"><div className="recruiter-brand-logo">💼</div><div><strong>JobRecruit</strong><span>Recruiter Portal</span></div></div><nav className="recruiter-navigation" aria-label="Recruiter navigation">{sidebarItems.map((item) => <NavLink className={({ isActive }) => `recruiter-nav-link${isActive ? " active" : ""}`} end={item.end} key={item.label} to={item.to}><span className="recruiter-nav-icon">{item.icon}</span><span>{item.label}</span></NavLink>)}</nav><div className="recruiter-sidebar-footer"><NavLink className="recruiter-nav-link" to="/" onClick={logout}><span className="recruiter-nav-icon">↪</span><span>Logout</span></NavLink></div></aside>;
}

function HeaderActions() {
  return <div className="recruiter-header-actions"><button aria-label="Notifications" className="recruiter-icon-button" type="button">🔔<span className="recruiter-notification-dot">3</span></button><div className="recruiter-avatar">AR</div><div className="recruiter-profile-label"><strong>Alex R.</strong><span>Hiring Manager</span></div></div>;
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(value) {
  return new Date(`2026-01-01T${value}`).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });
}

function formatStatus(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getInitials(name) {
  return name.split(" ").map((part) => part.charAt(0)).join("").slice(0, 2);
}

export default RecruiterInterviews;
