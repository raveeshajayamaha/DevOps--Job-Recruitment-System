import { logout } from "../../services/authService";
import { useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { getApplicationById } from "../../services/applicationService";
import { getJobById } from "../../services/jobService";
import { createInterview } from "../../services/interviewService";
import "./dashboard.css";
import "./interviews.css";

function ScheduleInterview() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const application = getApplicationById(applicationId);
  const job = application ? getJobById(application.jobId) : undefined;
  const [form, setForm] = useState(() => ({
    interviewDate: "",
    interviewTime: "",
    interviewType: "Video Call",
    meetingLink: "",
    notes: "",
  }));
  const [errors, setErrors] = useState({});

  if (!application) {
    return <RecruiterLayout><ScheduleState title="Application not found" message="The requested application could not be found." /></RecruiterLayout>;
  }

  if (application.status !== "shortlisted") {
    return <RecruiterLayout><ScheduleState title="Application is not shortlisted" message="Only shortlisted candidates can be scheduled for an interview." backTo="/recruiter/applications" backLabel="Back to Applications" /></RecruiterLayout>;
  }

  const updateField = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: "" }));
  };

  const saveInterview = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.interviewDate) nextErrors.interviewDate = "Interview date is required.";
    if (!form.interviewTime) nextErrors.interviewTime = "Interview time is required.";
    if (!form.interviewType) nextErrors.interviewType = "Interview type is required.";
    if (form.interviewType === "Video Call" && !form.meetingLink.trim()) nextErrors.meetingLink = "Meeting link is required for a video call.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const interview = createInterview({
      applicationId: application.id,
      candidateId: application.candidateId,
      jobId: application.jobId,
      candidateName: application.candidateName,
      candidateEmail: application.email,
      jobTitle: application.jobTitle,
      company: application.company,
      ...form,
    });
    navigate(`/recruiter/interviews/${interview.id}`);
  };

  return (
    <RecruiterLayout>
      <NavLink className="post-job-back-link" to={`/recruiter/applications/${application.id}`}>← Back to Application</NavLink>
      <section className="recruiter-card schedule-card">
        <div className="schedule-heading"><h2>Schedule Interview</h2><p>Create an interview for this shortlisted candidate.</p></div>
        <div className="schedule-candidate">
          <strong>{application.candidateName}</strong><span>{application.email} · {application.jobTitle} at {job?.company || application.company}</span>
        </div>
        <form className="schedule-form" onSubmit={saveInterview}>
          <FormField error={errors.interviewDate} label="Interview date"><input aria-label="Interview date" min="2026-01-01" onChange={(event) => updateField("interviewDate", event.target.value)} type="date" value={form.interviewDate} /></FormField>
          <FormField error={errors.interviewTime} label="Interview time"><input aria-label="Interview time" onChange={(event) => updateField("interviewTime", event.target.value)} type="time" value={form.interviewTime} /></FormField>
          <FormField error={errors.interviewType} label="Interview type"><select aria-label="Interview type" onChange={(event) => updateField("interviewType", event.target.value)} value={form.interviewType}><option>Video Call</option><option>Phone Call</option><option>In-person</option></select></FormField>
          <FormField error={errors.meetingLink} label="Meeting link"><input aria-label="Meeting link" onChange={(event) => updateField("meetingLink", event.target.value)} placeholder="https://..." type="url" value={form.meetingLink} /></FormField>
          <FormField error={errors.notes} label="Notes"><textarea aria-label="Interview notes" onChange={(event) => updateField("notes", event.target.value)} placeholder="Add notes for the interview..." rows="5" value={form.notes} /></FormField>
          <div className="schedule-actions"><NavLink className="edit-job-cancel" to={`/recruiter/applications/${application.id}`}>Cancel</NavLink><button className="recruiter-primary-button" type="submit">Schedule Interview</button></div>
        </form>
      </section>
    </RecruiterLayout>
  );
}

function FormField({ children, error, label }) { return <label className="schedule-field"><span>{label}</span>{children}{error && <small className="schedule-error">{error}</small>}</label>; }
function ScheduleState({ backLabel = "Back to Interviews", backTo = "/recruiter/interviews", message, title }) { return <section className="recruiter-card applications-empty" role="alert"><strong>{title}</strong><span>{message}</span><NavLink className="recruiter-primary-button" to={backTo}>{backLabel}</NavLink></section>; }
function RecruiterLayout({ children }) { return <div className="recruiter-dashboard recruiter-interviews-page"><RecruiterSidebar /><main className="recruiter-main"><header className="recruiter-header"><div><p className="recruiter-eyebrow">RECRUITER WORKSPACE</p><h1>Schedule Interview</h1><p className="recruiter-header-description">Arrange the next step for a shortlisted candidate.</p></div><div className="recruiter-header-actions"><button aria-label="Notifications" className="recruiter-icon-button" type="button">🔔<span className="recruiter-notification-dot">3</span></button><div className="recruiter-avatar">AR</div><div className="recruiter-profile-label"><strong>Alex R.</strong><span>Hiring Manager</span></div></div></header><div className="recruiter-content">{children}</div></main></div>; }
function RecruiterSidebar() { const items = [{ label: "Dashboard", icon: "⌂", to: "/recruiter/dashboard", end: true }, { label: "Post Job", icon: "+", to: "/recruiter/jobs/new", end: true }, { label: "Manage Jobs", icon: "▣", to: "/recruiter/jobs", end: true }, { label: "Applications", icon: "✓", to: "/recruiter/applications" }, { label: "Interviews", icon: "◷", to: "/recruiter/interviews" }, { label: "Profile", icon: "◎", to: "/recruiter/profile" }, { label: "Settings", icon: "⚙", to: "/recruiter/settings" }]; return <aside className="recruiter-sidebar"><div className="recruiter-brand"><div className="recruiter-brand-logo">💼</div><div><strong>JobRecruit</strong><span>Recruiter Portal</span></div></div><nav className="recruiter-navigation" aria-label="Recruiter navigation">{items.map((item) => <NavLink className={({ isActive }) => `recruiter-nav-link${isActive ? " active" : ""}`} end={item.end} key={item.label} to={item.to}><span className="recruiter-nav-icon">{item.icon}</span><span>{item.label}</span></NavLink>)}</nav><div className="recruiter-sidebar-footer"><NavLink className="recruiter-nav-link" to="/" onClick={logout}><span className="recruiter-nav-icon">↪</span><span>Logout</span></NavLink></div></aside>; }

export default ScheduleInterview;
