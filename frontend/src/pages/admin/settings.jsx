import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { useAdminTheme } from "./AdminThemeContext";
import "./dashboard.css";
import "./settings.css";

const settingsPreview = {
  platformName: "JobRecruit",
  platformDescription: "A job recruitment and applicant tracking platform.",
  adminName: "Admin Preview",
  adminEmail: "admin.preview@example.com",
  applicationVersion: "0.0.0",
};

const initialPreviewValues = {
  platformName: settingsPreview.platformName,
  platformDescription: settingsPreview.platformDescription,
  adminName: settingsPreview.adminName,
  adminEmail: settingsPreview.adminEmail,
};

function AdminSettings() {
  const { theme, setTheme } = useAdminTheme();
  const [formValues, setFormValues] = useState(initialPreviewValues);
  const [previewValues, setPreviewValues] = useState(initialPreviewValues);
  const [statusMessage, setStatusMessage] = useState("");
  const [formError, setFormError] = useState("");

  const updateField = (field, value) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setFormError("");
    setStatusMessage("");
  };

  const applyPreviewChanges = (event) => {
    event.preventDefault();
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.adminEmail.trim());
    if (!formValues.platformName.trim() || !formValues.platformDescription.trim() || !formValues.adminName.trim() || !formValues.adminEmail.trim()) {
      setFormError("Complete all required preview fields before applying.");
      setStatusMessage("");
      return;
    }
    if (!emailIsValid) {
      setFormError("Enter a valid illustrative email address.");
      setStatusMessage("");
      return;
    }
    setPreviewValues({
      platformName: formValues.platformName.trim(),
      platformDescription: formValues.platformDescription.trim(),
      adminName: formValues.adminName.trim(),
      adminEmail: formValues.adminEmail.trim(),
    });
    setStatusMessage("Preview values applied in this Settings view only. They are not saved to a database.");
    setFormError("");
  };

  const resetPreview = () => {
    setFormValues(initialPreviewValues);
    setPreviewValues(initialPreviewValues);
    setTheme("light");
    setFormError("");
    setStatusMessage("Preview values and theme reset. Nothing was saved to a database.");
  };

  return (
    <div className="admin-dashboard" data-admin-theme={theme}>
      <AdminSidebar />
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb"><span>Workspace</span><span className="admin-breadcrumb-separator">/</span><strong>Settings</strong></div>
          <div className="admin-topbar-right"><span className="admin-demo-badge"><span /> Demo data</span><div className="admin-avatar" aria-label="Admin profile preview">AD</div></div>
        </header>

        <div className="admin-content">
          <section className="admin-welcome">
            <div><p className="admin-eyebrow">ADMINISTRATION</p><h1>Settings</h1><p className="admin-welcome-copy">Review platform, account, and appearance settings for the preview.</p></div>
          </section>

          <div className="admin-sample-notice" role="note">
            <span className="admin-notice-icon" aria-hidden="true">i</span>
            <span><strong>Preview only</strong> — settings are temporary, apply only in this Settings view, and are not saved to a database.</span>
          </div>

          <form className="admin-settings-form" onSubmit={applyPreviewChanges}>
            <div className="admin-settings-grid">
            <section className="admin-panel admin-settings-section" aria-labelledby="admin-settings-general-title">
              <div className="admin-panel-heading"><div><h2 id="admin-settings-general-title">General Settings</h2><p>Basic platform information shown for preview.</p></div></div>
              <div className="admin-settings-fields">
                <label className="admin-settings-field">Platform name <span aria-hidden="true">*</span><input required value={formValues.platformName} onChange={(event) => updateField("platformName", event.target.value)} aria-label="Platform name preview" /></label>
                <label className="admin-settings-field">Platform description <span aria-hidden="true">*</span><textarea required rows="3" value={formValues.platformDescription} onChange={(event) => updateField("platformDescription", event.target.value)} aria-label="Platform description preview" /></label>
              </div>
              <p className="admin-settings-footnote">Preview inputs only; no platform configuration is persisted.</p>
            </section>

            <section className="admin-panel admin-settings-section" aria-labelledby="admin-settings-account-title">
              <div className="admin-panel-heading"><div><h2 id="admin-settings-account-title">Account Settings</h2><p>Illustrative admin profile details only.</p></div></div>
              <div className="admin-settings-fields">
                <label className="admin-settings-field">Display name <span aria-hidden="true">*</span><input required value={formValues.adminName} onChange={(event) => updateField("adminName", event.target.value)} aria-label="Illustrative display name" /></label>
                <label className="admin-settings-field">Email <span aria-hidden="true">*</span><input required type="email" value={formValues.adminEmail} onChange={(event) => updateField("adminEmail", event.target.value)} aria-label="Illustrative email" /></label>
              </div>
              <p className="admin-settings-footnote">These editable preview values do not represent an authenticated account.</p>
            </section>

            <section className="admin-panel admin-settings-section" aria-labelledby="admin-settings-appearance-title">
              <div className="admin-panel-heading"><div><h2 id="admin-settings-appearance-title">Appearance</h2><p>Preview the theme across the Admin workspace.</p></div></div>
              <div className="admin-settings-theme-preview">
                <div><strong>{theme === "light" ? "Light theme selected" : "Dark theme selected"}</strong><span>The selected theme applies to all Admin workspace pages during this session.</span></div>
                <div className="admin-settings-theme-controls" role="group" aria-label="Admin workspace theme preview">
                  <button type="button" className={theme === "light" ? "selected" : ""} aria-pressed={theme === "light"} onClick={() => setTheme("light")}>Light</button>
                  <button type="button" className={theme === "dark" ? "selected" : ""} aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>Dark</button>
                </div>
              </div>
              <p className="admin-settings-footnote">Preview only; the theme is not saved and does not affect Candidate or Recruiter pages.</p>
            </section>

            <section className="admin-panel admin-settings-section" aria-labelledby="admin-settings-system-title">
              <div className="admin-panel-heading"><div><h2 id="admin-settings-system-title">System Information</h2><p>Values verifiable from the frontend project.</p></div></div>
              <dl className="admin-settings-details">
                <div><dt>Application version</dt><dd>{settingsPreview.applicationVersion}</dd></div>
                <div><dt>Version source</dt><dd>frontend/package.json</dd></div>
              </dl>
              <p className="admin-settings-footnote">No environment value is displayed because none is established here.</p>
            </section>
          </div>
          <div className="admin-settings-actions">
            <p className="admin-settings-required-note">* Required preview fields</p>
            <div><button className="admin-settings-apply" type="submit">Apply Preview Changes</button><button className="admin-settings-reset" type="button" onClick={resetPreview}>Reset Preview</button></div>
          </div>
          {formError && <p className="admin-settings-feedback error" role="alert">{formError}</p>}
          {statusMessage && <p className="admin-settings-feedback success" role="status" aria-live="polite">{statusMessage}</p>}
          <p className="admin-settings-preview-result"><strong>Current Settings Preview:</strong> {previewValues.platformName} — {previewValues.platformDescription} · {previewValues.adminName} ({previewValues.adminEmail})</p>
          </form>

          <footer className="admin-footer">© 2026 JobRecruit <span>•</span> Admin settings preview</footer>
        </div>
      </main>
    </div>
  );
}

export default AdminSettings;
