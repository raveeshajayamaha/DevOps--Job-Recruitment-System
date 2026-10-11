import { useState } from "react";
import { NavLink } from "react-router-dom";
import { getRecruiterProfile, updateRecruiterProfile } from "../../services/recruiterProfileService";
import "./dashboard.css";
import "./profile.css";

const sidebarItems = [
  { label: "Dashboard", icon: "⌂", to: "/recruiter/dashboard", end: true },
  { label: "Post Job", icon: "+", to: "/recruiter/jobs/new", end: true },
  { label: "Manage Jobs", icon: "▣", to: "/recruiter/jobs", end: true },
  { label: "Applications", icon: "✓", to: "/recruiter/applications" },
  { label: "Interviews", icon: "◷", to: "/recruiter/interviews" },
  { label: "Profile", icon: "◎", to: "/recruiter/profile", end: true },
  { label: "Settings", icon: "⚙", to: "/recruiter/settings", end: true },
];

function RecruiterProfile() {
  const [profile, setProfile] = useState(() => getRecruiterProfile());
  const [draft, setDraft] = useState(() => getRecruiterProfile());
  const [editing, setEditing] = useState(false);
  const [feedback, setFeedback] = useState("");

  const updateField = (field, value) => {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
    setFeedback("");
  };

  const saveProfile = (event) => {
    event.preventDefault();
    const updatedProfile = updateRecruiterProfile(draft);
    setProfile(updatedProfile);
    setDraft(updatedProfile);
    setEditing(false);
    setFeedback("Profile changes saved successfully.");
  };

  const cancelEditing = () => {
    setDraft(profile);
    setEditing(false);
    setFeedback("");
  };

  return (
    <RecruiterLayout>
      <div className="profile-page-toolbar">
        <div>
          <p className="recruiter-eyebrow">RECRUITER WORKSPACE</p>
          <h1>Recruiter Profile</h1>
          <p className="profile-page-description">Manage your professional information and recruiter identity.</p>
        </div>
        {!editing && <button className="recruiter-primary-button profile-edit-button" onClick={() => { setFeedback(""); setEditing(true); }} type="button">Edit Profile</button>}
      </div>

      <section className="recruiter-card profile-card">
        <div className="profile-card-heading">
          <div className="profile-avatar">{getInitials(profile)}</div>
          <div>
            <h2>{profile.firstName} {profile.lastName}</h2>
            <p>{profile.jobTitle} at {profile.company}</p>
          </div>
        </div>

        {editing ? (
          <form className="profile-form" onSubmit={saveProfile}>
            <ProfileField label="First name" name="firstName" onChange={updateField} value={draft.firstName} />
            <ProfileField label="Last name" name="lastName" onChange={updateField} value={draft.lastName} />
            <ProfileField label="Email" name="email" onChange={updateField} type="email" value={draft.email} />
            <ProfileField label="Phone" name="phone" onChange={updateField} value={draft.phone} />
            <ProfileField label="Job title / role" name="jobTitle" onChange={updateField} value={draft.jobTitle} />
            <ProfileField label="Company" name="company" onChange={updateField} value={draft.company} />
            <ProfileField label="Location" name="location" onChange={updateField} value={draft.location} />
            <ProfileField label="Professional information" name="professionalSummary" onChange={updateField} textarea value={draft.professionalSummary} />
            <div className="profile-form-actions">
              <button className="profile-cancel-button" onClick={cancelEditing} type="button">Cancel</button>
              <button className="recruiter-primary-button" type="submit">Save Changes</button>
            </div>
          </form>
        ) : (
          <div className="profile-information">
            <ProfileFact label="Email" value={profile.email} />
            <ProfileFact label="Phone" value={profile.phone} />
            <ProfileFact label="Job title / role" value={profile.jobTitle} />
            <ProfileFact label="Company" value={profile.company} />
            <ProfileFact label="Location" value={profile.location} />
            <div className="profile-fact profile-summary-fact">
              <span>Professional information</span>
              <strong>{profile.professionalSummary}</strong>
            </div>
          </div>
        )}
        {feedback && <div className="post-job-success" role="status"><strong>{feedback}</strong></div>}
      </section>
    </RecruiterLayout>
  );
}

function RecruiterLayout({ children }) {
  return (
    <div className="recruiter-dashboard recruiter-profile-page">
      <RecruiterSidebar />
      <main className="recruiter-main">
        <header className="recruiter-header">
          <div>
            <p className="recruiter-eyebrow">Recruiter workspace</p>
            <h1>Profile</h1>
            <p className="recruiter-header-description">Keep your recruiter profile up to date.</p>
          </div>
          <HeaderActions />
        </header>
        <div className="recruiter-content">{children}</div>
      </main>
    </div>
  );
}

function RecruiterSidebar() {
  return (
    <aside className="recruiter-sidebar">
      <div className="recruiter-brand"><div className="recruiter-brand-logo">💼</div><div><strong>JobRecruit</strong><span>Recruiter Portal</span></div></div>
      <nav className="recruiter-navigation" aria-label="Recruiter navigation">
        {sidebarItems.map((item) => <NavLink className={({ isActive }) => `recruiter-nav-link${isActive ? " active" : ""}`} end={item.end} key={item.label} to={item.to}><span className="recruiter-nav-icon">{item.icon}</span><span>{item.label}</span></NavLink>)}
      </nav>
      <div className="recruiter-sidebar-footer"><NavLink className="recruiter-nav-link" to="/"><span className="recruiter-nav-icon">↪</span><span>Logout</span></NavLink></div>
    </aside>
  );
}

function HeaderActions() {
  return <div className="recruiter-header-actions"><button aria-label="Notifications" className="recruiter-icon-button" type="button">🔔<span className="recruiter-notification-dot">3</span></button><div className="recruiter-avatar">AR</div><div className="recruiter-profile-label"><strong>Alex R.</strong><span>Hiring Manager</span></div></div>;
}

function ProfileField({ label, name, onChange, textarea = false, type = "text", value }) {
  return <label className={`profile-field${textarea ? " profile-field-wide" : ""}`}><span>{label}</span>{textarea ? <textarea name={name} onChange={(event) => onChange(name, event.target.value)} rows="4" value={value} /> : <input name={name} onChange={(event) => onChange(name, event.target.value)} type={type} value={value} />}</label>;
}

function ProfileFact({ label, value }) {
  return <div className="profile-fact"><span>{label}</span><strong>{value}</strong></div>;
}

function getInitials(profile) {
  return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`;
}

export default RecruiterProfile;
