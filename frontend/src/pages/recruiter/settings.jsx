import { logout } from "../../services/authService";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { getRecruiterSettings, resetRecruiterSettings, updateRecruiterSettings } from "../../services/recruiterSettingsService";
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

function RecruiterSettings() {
  const [settings, setSettings] = useState(() => getRecruiterSettings());
  const [feedback, setFeedback] = useState("");

  const updateSetting = (field) => {
    setSettings((currentSettings) => ({ ...currentSettings, [field]: !currentSettings[field] }));
    setFeedback("");
  };

  const saveSettings = (event) => {
    event.preventDefault();
    setSettings(updateRecruiterSettings(settings));
    setFeedback("Settings saved successfully.");
  };

  const resetSettings = () => {
    setSettings(resetRecruiterSettings());
    setFeedback("Settings reset to their defaults.");
  };

  return (
    <RecruiterLayout>
      <div className="settings-page-toolbar">
        <div>
          <p className="recruiter-eyebrow">RECRUITER WORKSPACE</p>
          <h1>Settings</h1>
          <p className="profile-page-description">Manage notifications and workspace preferences.</p>
        </div>
      </div>
      <form className="settings-form" onSubmit={saveSettings}>
        <section className="recruiter-card settings-card">
          <div className="settings-card-heading"><h2>Notification preferences</h2><p>Choose which recruiter activity updates you want to receive.</p></div>
          <SettingsToggle checked={settings.emailNotifications} description="Receive important account and workspace updates." label="Email notifications" onChange={() => updateSetting("emailNotifications")} />
          <SettingsToggle checked={settings.interviewReminders} description="Get reminders before scheduled candidate interviews." label="Interview reminders" onChange={() => updateSetting("interviewReminders")} />
          <SettingsToggle checked={settings.applicationNotifications} description="Be notified when candidates apply to your job postings." label="Application notifications" onChange={() => updateSetting("applicationNotifications")} />
          <SettingsToggle checked={settings.jobPostingNotifications} description="Receive updates about your job postings and deadlines." label="Job posting notifications" onChange={() => updateSetting("jobPostingNotifications")} />
        </section>
        <section className="recruiter-card settings-card">
          <div className="settings-card-heading"><h2>Workspace preferences</h2><p>Adjust how information is presented in your recruiter workspace.</p></div>
          <SettingsToggle checked={settings.compactView} description="Use a denser layout for job and application lists." label="Compact view" onChange={() => updateSetting("compactView")} />
        </section>
        <div className="settings-actions">
          {feedback && <span className="post-job-success" role="status"><strong>{feedback}</strong></span>}
          <button className="profile-cancel-button" onClick={resetSettings} type="button">Reset</button>
          <button className="recruiter-primary-button" type="submit">Save Settings</button>
        </div>
      </form>
    </RecruiterLayout>
  );
}

function RecruiterLayout({ children }) {
  return <div className="recruiter-dashboard recruiter-settings-page"><RecruiterSidebar /><main className="recruiter-main"><header className="recruiter-header"><div><p className="recruiter-eyebrow">Recruiter workspace</p><h1>Settings</h1><p className="recruiter-header-description">Configure your recruiter workspace.</p></div><HeaderActions /></header><div className="recruiter-content">{children}</div></main></div>;
}

function RecruiterSidebar() {
  return <aside className="recruiter-sidebar"><div className="recruiter-brand"><div className="recruiter-brand-logo">💼</div><div><strong>JobRecruit</strong><span>Recruiter Portal</span></div></div><nav className="recruiter-navigation" aria-label="Recruiter navigation">{sidebarItems.map((item) => <NavLink className={({ isActive }) => `recruiter-nav-link${isActive ? " active" : ""}`} end={item.end} key={item.label} to={item.to}><span className="recruiter-nav-icon">{item.icon}</span><span>{item.label}</span></NavLink>)}</nav><div className="recruiter-sidebar-footer"><NavLink className="recruiter-nav-link" to="/" onClick={logout}><span className="recruiter-nav-icon">↪</span><span>Logout</span></NavLink></div></aside>;
}

function HeaderActions() {
  return <div className="recruiter-header-actions"><button aria-label="Notifications" className="recruiter-icon-button" type="button">🔔<span className="recruiter-notification-dot">3</span></button><div className="recruiter-avatar">AR</div><div className="recruiter-profile-label"><strong>Alex R.</strong><span>Hiring Manager</span></div></div>;
}

function SettingsToggle({ checked, description, label, onChange }) {
  return <label className="settings-toggle"><span><strong>{label}</strong><small>{description}</small></span><input aria-label={label} checked={checked} onChange={onChange} type="checkbox" /><span className="toggle-control" aria-hidden="true" /></label>;
}

export default RecruiterSettings;
