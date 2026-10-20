import { logout } from "../../services/authService";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { getInterviewById, updateInterviewStatus } from "../../services/interviewService";
import "./dashboard.css";
import "./interviews.css";

function RecruiterInterviewDetails() {
  const { interviewId } = useParams();
  const [result, setResult] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    getInterviewById(interviewId, controller.signal).then(interview => setResult({ interviewId, interview }))
      .catch(error => { if (!controller.signal.aborted) setResult({ interviewId, error }); });
    return () => controller.abort();
  }, [interviewId]);
  const loading = !result || result.interviewId !== interviewId;
  const interview = loading ? null : result.interview;
  const [feedback, setFeedback] = useState("");

  if (loading) return <RecruiterLayout><p role="status">Loading interview...</p></RecruiterLayout>;

  if (!interview) {
    return <RecruiterLayout><InterviewState title="Interview not found" message={result.error?.message || "The requested interview could not be found."} /></RecruiterLayout>;
  }

  const changeStatus = async (status) => {
    if (updating) return;
    setUpdating(true); setUpdateError(''); setFeedback('');
    try {
      const updated = await updateInterviewStatus(interview.id, status);
      setResult({ interviewId, interview: updated });
      setFeedback('Interview marked as ' + status + '.');
    } catch (error) { setUpdateError(error.message); }
    finally { setUpdating(false); }
  };

  return (
    <RecruiterLayout>
      <NavLink className="post-job-back-link" to="/recruiter/interviews">← Back to Interviews</NavLink>
      <div className="interview-details-grid">
        <section className="recruiter-card interview-detail-card">
          <div className="interview-detail-heading">
            <div className="candidate-avatar">{getInitials(interview.candidateName)}</div>
            <div><h2>{interview.candidateName}</h2><p>{interview.candidateEmail}</p></div>
            <span className={`recruiter-status ${interview.status}`}>{formatStatus(interview.status)}</span>
          </div>
          <DetailSection title="Candidate Information">
            <DetailFact label="Candidate" value={interview.candidateName} />
            <DetailFact label="Email" value={interview.candidateEmail} />
          </DetailSection>
          <DetailSection title="Applied Job">
            <DetailFact label="Job Title" value={interview.jobTitle} />
            <DetailFact label="Company" value={interview.company} />
          </DetailSection>
        </section>
        <section className="recruiter-card interview-status-card">
          <h2>Interview Information</h2>
          <DetailFact label="Round" value={interview.round} />
          <DetailFact label="Date" value={formatDate(interview.interviewDate)} />
          <DetailFact label="Time" value={formatTime(interview.interviewTime)} />
          <DetailFact label="Type" value={interview.interviewType} />
          <DetailFact label="Meeting Link" value={interview.meetingLink || "Not applicable"} />
          <DetailFact label="Notes" value={interview.notes || "No notes added"} />
          <div className="interview-actions">
            {interview.status !== "completed" && <button className="application-shortlist-button" disabled={updating} onClick={() => changeStatus("completed")} type="button">Mark Completed</button>}
            {interview.status !== "cancelled" && <button className="application-reject-button" disabled={updating} onClick={() => changeStatus("cancelled")} type="button">Cancel Interview</button>}
          </div>
          {updateError && <p role="alert">{updateError}</p>}
          {feedback && <div className="post-job-success" role="status"><strong>{feedback}</strong></div>}
        </section>
      </div>
    </RecruiterLayout>
  );
}

function RecruiterLayout({ children }) {
  return <div className="recruiter-dashboard recruiter-interviews-page"><RecruiterSidebar /><main className="recruiter-main"><header className="recruiter-header"><div><p className="recruiter-eyebrow">RECRUITER WORKSPACE</p><h1>Interview Details</h1><p className="recruiter-header-description">Review interview information and status.</p></div><div className="recruiter-header-actions"><button aria-label="Notifications" className="recruiter-icon-button" type="button">🔔<span className="recruiter-notification-dot">3</span></button><div className="recruiter-avatar">AR</div><div className="recruiter-profile-label"><strong>Alex R.</strong><span>Hiring Manager</span></div></div></header><div className="recruiter-content">{children}</div></main></div>;
}

function RecruiterSidebar() {
  const items = [{ label: "Dashboard", icon: "⌂", to: "/recruiter/dashboard", end: true }, { label: "Post Job", icon: "+", to: "/recruiter/jobs/new", end: true }, { label: "Manage Jobs", icon: "▣", to: "/recruiter/jobs", end: true }, { label: "Applications", icon: "✓", to: "/recruiter/applications" }, { label: "Interviews", icon: "◷", to: "/recruiter/interviews" }, { label: "Profile", icon: "◎", to: "/recruiter/profile" }, { label: "Settings", icon: "⚙", to: "/recruiter/settings" }];
  return <aside className="recruiter-sidebar"><div className="recruiter-brand"><div className="recruiter-brand-logo">💼</div><div><strong>JobRecruit</strong><span>Recruiter Portal</span></div></div><nav className="recruiter-navigation" aria-label="Recruiter navigation">{items.map((item) => <NavLink className={({ isActive }) => `recruiter-nav-link${isActive ? " active" : ""}`} end={item.end} key={item.label} to={item.to}><span className="recruiter-nav-icon">{item.icon}</span><span>{item.label}</span></NavLink>)}</nav><div className="recruiter-sidebar-footer"><NavLink className="recruiter-nav-link" to="/" onClick={logout}><span className="recruiter-nav-icon">↪</span><span>Logout</span></NavLink></div></aside>;
}

function DetailSection({ children, title }) { return <section className="interview-detail-section"><h2>{title}</h2><div className="interview-detail-facts">{children}</div></section>; }
function DetailFact({ label, value }) { return <div className="interview-detail-fact"><span>{label}</span><strong>{value}</strong></div>; }
function InterviewState({ message, title }) { return <section className="recruiter-card applications-empty" role="alert"><strong>{title}</strong><span>{message}</span><NavLink className="recruiter-primary-button" to="/recruiter/interviews">Back to Interviews</NavLink></section>; }
function formatDate(value) { return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
function formatTime(value) { return new Date(`2026-01-01T${value}`).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" }); }
function formatStatus(value) { return value.charAt(0).toUpperCase() + value.slice(1); }
function getInitials(name) { return name.split(" ").map((part) => part.charAt(0)).join("").slice(0, 2); }

export default RecruiterInterviewDetails;
