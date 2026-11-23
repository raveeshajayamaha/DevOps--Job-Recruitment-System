import { logout } from "../../services/authService";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getProfile, updateProfile } from "../../services/profileService";
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
  const [profile, setProfile] = useState(emptyProfile);
  const [draft, setDraft] = useState(emptyProfile);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadProfile = useCallback(async (signal) => {
    try {
      const data = await getProfile(signal);
      const loadedProfile = normalizeProfile(data?.profile);
      setProfile(loadedProfile);
      setDraft(loadedProfile);
      setError("");
      setLoadFailed(false);
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        setLoadFailed(true);
        setError(requestError.message || "Unable to load your profile. Please try again.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) void loadProfile(controller.signal);
    });
    return () => controller.abort();
  }, [loadProfile]);

  const retryLoad = () => {
    setLoading(true);
    setError("");
    setLoadFailed(false);
    void loadProfile();
  };

  const updateField = (field, value) => {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
    setError("");
    setSaved(false);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const fields = Object.fromEntries(recruiterFields.map((field) => [field, draft[field]]));

    try {
      const updatedProfile = await updateProfile(fields);
      const normalizedProfile = normalizeProfile(updatedProfile);
      setProfile(normalizedProfile);
      setDraft(normalizedProfile);
      setEditing(false);
      setSaved(true);
    } catch (requestError) {
      setError(requestError.message || "Unable to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setDraft(profile);
    setEditing(false);
    setError("");
    setSaved(false);
  };

  return (
    <RecruiterLayout profile={profile}>
      <div className="profile-page-toolbar">
        <div>
          <p className="recruiter-eyebrow">RECRUITER WORKSPACE</p>
          <h1>Recruiter Profile</h1>
          <p className="profile-page-description">Manage your professional information and recruiter identity.</p>
        </div>
        {!editing && <button className="recruiter-primary-button profile-edit-button" disabled={loading || loadFailed} onClick={() => { setError(""); setSaved(false); setEditing(true); }} type="button">Edit Profile</button>}
      </div>

      <section className="recruiter-card profile-card">
        {loading && <p role="status">Loading your profile…</p>}
        {error && (
          <div className="profile-request-error" role="alert">
            <span>{error}</span>
            {loadFailed && !loading && <button className="profile-retry-button" onClick={retryLoad} type="button">Try again</button>}
          </div>
        )}
        <div className="profile-card-heading">
          <div className="profile-avatar">{getInitials(profile)}</div>
          <div>
            <h2>{`${profile.firstName} ${profile.lastName}`.trim() || "Recruiter profile"}</h2>
            <p>{[profile.jobTitle, profile.company].filter(Boolean).join(" at ")}</p>
          </div>
        </div>

        {editing ? (
          <form className="profile-form" onSubmit={saveProfile}>
            <ProfileField disabled={saving} label="First name" name="firstName" onChange={updateField} value={draft.firstName} />
            <ProfileField disabled={saving} label="Last name" name="lastName" onChange={updateField} value={draft.lastName} />
            <ProfileField label="Email" name="email" readOnly type="email" value={profile.email} />
            <ProfileField disabled={saving} label="Phone" name="phone" onChange={updateField} value={draft.phone} />
            <ProfileField disabled={saving} label="Job title / role" name="jobTitle" onChange={updateField} value={draft.jobTitle} />
            <ProfileField disabled={saving} label="Company" name="company" onChange={updateField} value={draft.company} />
            <ProfileField disabled={saving} label="Location" name="location" onChange={updateField} value={draft.location} />
            <ProfileField disabled={saving} label="Professional information" name="professionalSummary" onChange={updateField} textarea value={draft.professionalSummary} />
            <div className="profile-form-actions">
              <button className="profile-cancel-button" disabled={saving} onClick={cancelEditing} type="button">Cancel</button>
              <button className="recruiter-primary-button" disabled={saving} type="submit">{saving ? "Saving…" : "Save Changes"}</button>
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
              <strong>{profile.professionalSummary || "Not provided"}</strong>
            </div>
          </div>
        )}
        {saved && <div className="post-job-success" role="status"><strong>Profile changes saved successfully.</strong></div>}
      </section>
    </RecruiterLayout>
  );
}

function RecruiterLayout({ children, profile }) {
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
          <HeaderActions profile={profile} />
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
      <div className="recruiter-sidebar-footer"><NavLink className="recruiter-nav-link" to="/" onClick={logout}><span className="recruiter-nav-icon">↪</span><span>Logout</span></NavLink></div>
    </aside>
  );
}

function HeaderActions({ profile }) {
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  return <div className="recruiter-header-actions"><button aria-label="Notifications" className="recruiter-icon-button" type="button">🔔<span className="recruiter-notification-dot">3</span></button><div className="recruiter-avatar">{getInitials(profile)}</div><div className="recruiter-profile-label"><strong>{fullName || "Recruiter"}</strong><span>{profile.jobTitle || "Recruiter"}</span></div></div>;
}

function ProfileField({ disabled = false, label, name, onChange, readOnly = false, textarea = false, type = "text", value }) {
  return <label className={`profile-field${textarea ? " profile-field-wide" : ""}`}><span>{label}</span>{textarea ? <textarea disabled={disabled} name={name} onChange={(event) => onChange(name, event.target.value)} rows="4" value={value} /> : <input disabled={disabled} name={name} onChange={onChange ? (event) => onChange(name, event.target.value) : undefined} readOnly={readOnly} type={type} value={value} />}</label>;
}

function ProfileFact({ label, value }) {
  return <div className="profile-fact"><span>{label}</span><strong>{value}</strong></div>;
}

function getInitials(profile) {
  const initials = `${profile.firstName.trim().charAt(0)}${profile.lastName.trim().charAt(0)}`;
  return initials || "R";
}

const recruiterFields = ["firstName", "lastName", "phone", "location", "jobTitle", "company", "professionalSummary"];
const emptyProfile = Object.fromEntries([...recruiterFields, "email"].map((field) => [field, ""]));

function normalizeProfile(profile = {}) {
  return Object.fromEntries(Object.keys(emptyProfile).map((field) => [field, profile[field] ?? ""]));
}

export default RecruiterProfile;
