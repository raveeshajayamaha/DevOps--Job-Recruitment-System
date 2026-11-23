import { useEffect, useState } from "react";
import CandidateLayout from "./candidateLayout";
import { getSettings, updateSettings } from "../../services/profileService";

function Settings() {
  const [email, setEmail] = useState("alex.perera@example.com");
  const [activeModal, setActiveModal] = useState(null);
  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    confirmEmail: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [modalErrors, setModalErrors] = useState({});
  const [accountMessage, setAccountMessage] = useState("");
  const [preferences, setPreferences] = useState(null);
  const [settingsError, setSettingsError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getSettings(controller.signal)
      .then((settings) => {
        setPreferences({
          recommendations: settings.recommendations,
          applications: settings.applications,
          interviews: settings.interviews,
          visibility: settings.visibility,
        });
        setSettingsError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setSettingsError(error.message);
      });

    return () => controller.abort();
  }, [loadAttempt]);

  const toggleNotification = (name) => {
    setSaved(false);
    setSettingsError("");
    setPreferences((current) => ({ ...current, [name]: !current[name] }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!preferences || saving) return;

    setSaving(true);
    setSaved(false);
    setSettingsError("");
    try {
      const updated = await updateSettings(preferences);
      setPreferences({
        recommendations: updated.recommendations,
        applications: updated.applications,
        interviews: updated.interviews,
        visibility: updated.visibility,
      });
      setSaved(true);
    } catch (error) {
      setSettingsError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const openModal = (modal) => {
    setAccountMessage("");
    setModalErrors({});
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalErrors({});
    setEmailForm({ newEmail: "", confirmEmail: "" });
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleEmailSave = () => {
    const errors = {};
    const normalizedEmail = emailForm.newEmail.trim();
    const normalizedConfirmation = emailForm.confirmEmail.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail) {
      errors.newEmail = "Enter a new email address.";
    } else if (!emailPattern.test(normalizedEmail)) {
      errors.newEmail = "Enter a valid email address.";
    }

    if (!normalizedConfirmation) {
      errors.confirmEmail = "Confirm your new email address.";
    } else if (normalizedEmail !== normalizedConfirmation) {
      errors.confirmEmail = "Email addresses do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      return;
    }

    setEmail(normalizedEmail);
    closeModal();
    setAccountMessage("Email updated successfully.");
  };

  const handlePasswordUpdate = () => {
    const errors = {};
    const minimumPasswordLength = 8;

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Enter your current password.";
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "Enter a new password.";
    } else if (passwordForm.newPassword.length < minimumPasswordLength) {
      errors.newPassword = "Password must be at least 8 characters.";
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Confirm your new password.";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      return;
    }

    closeModal();
    setAccountMessage("Password updated successfully.");
  };

  return (
    <CandidateLayout title="Settings" eyebrow="Account preferences">
      <form className="settings-grid" onSubmit={handleSave} aria-busy={saving}>
        <section className="candidate-card settings-section">
          <div className="candidate-card-heading"><div><h2>Account settings</h2><p>Manage the details you use to access your account.</p></div></div>
          <div className="settings-account-row"><div><span className="settings-label">Email address</span><strong>{email}</strong></div><button type="button" className="secondary-action" onPointerDown={() => openModal("email")} onClick={() => openModal("email")}>Change email</button></div>
          <div className="settings-account-row"><div><span className="settings-label">Password</span><strong>••••••••••••</strong></div><button type="button" className="secondary-action" onPointerDown={() => openModal("password")} onClick={() => openModal("password")}>Change password</button></div>
        </section>

        <section className="candidate-card settings-section">
          <div className="candidate-card-heading"><div><h2>Notification settings</h2><p>Choose which updates you would like to receive.</p></div></div>
          {!preferences ? (settingsError ? <p role="alert">Could not load settings: {settingsError} <button type="button" className="secondary-action" onClick={() => { setSettingsError(""); setLoadAttempt((attempt) => attempt + 1); }}>Retry</button></p> : <p role="status">Loading settings...</p>) : <>
            <SettingToggle label="Job recommendations" description="Receive opportunities based on your profile." checked={preferences.recommendations} disabled={saving} onChange={() => toggleNotification("recommendations")} />
            <SettingToggle label="Application updates" description="Get notified when an application status changes." checked={preferences.applications} disabled={saving} onChange={() => toggleNotification("applications")} />
            <SettingToggle label="Interview notifications" description="Receive reminders about upcoming interviews." checked={preferences.interviews} disabled={saving} onChange={() => toggleNotification("interviews")} />
          </>}
        </section>

        <section className="candidate-card settings-section">
          <div className="candidate-card-heading"><div><h2>Privacy settings</h2><p>Control how recruiters can discover your profile.</p></div></div>
          {preferences && <label className="visibility-label">Profile visibility<select disabled={saving} value={preferences.visibility} onChange={(event) => { setSaved(false); setSettingsError(""); setPreferences((current) => ({ ...current, visibility: event.target.value })); }}><option>Public</option><option>Recruiters only</option><option>Private</option></select></label>}
        </section>

        <section className="candidate-card settings-section account-actions">
          <div className="candidate-card-heading"><div><h2>Account actions</h2><p>Sign out or permanently remove your account.</p></div></div>
          <div className="account-action-row"><div><strong>Log out</strong><span>End your current session on this device.</span></div><button type="button" className="secondary-action">Log out</button></div>
          <div className="account-action-row danger-row"><div><strong>Delete account</strong><span>This is a frontend-only preview. No account will be deleted.</span></div><button type="button" className="danger-action">Delete account</button></div>
        </section>

        <div className="settings-form-actions">
          {settingsError && preferences && <span role="alert">Could not save settings: {settingsError}</span>}
          {saved && <span className="save-message" role="status">Settings saved successfully.</span>}
          {saving && <span role="status">Saving settings...</span>}
          <button type="submit" className="primary-action" disabled={!preferences || saving}>Save Settings</button>
        </div>
      </form>
      {accountMessage && <p className="account-success-message" role="status">{accountMessage}</p>}
      {activeModal === "email" && (
        <AccountModal
          title="Change email"
          description="Update the email address associated with your candidate account."
          onClose={closeModal}
          onSubmit={handleEmailSave}
          submitLabel="Save Email"
        >
          <div className="modal-current-value">
            <span>Current Email</span>
            <strong>{email}</strong>
          </div>
          <ModalField
            label="New Email"
            type="email"
            value={emailForm.newEmail}
            error={modalErrors.newEmail}
            onChange={(value) => {
              setEmailForm({ ...emailForm, newEmail: value });
              setModalErrors({ ...modalErrors, newEmail: "" });
            }}
          />
          <ModalField
            label="Confirm New Email"
            type="email"
            value={emailForm.confirmEmail}
            error={modalErrors.confirmEmail}
            onChange={(value) => {
              setEmailForm({ ...emailForm, confirmEmail: value });
              setModalErrors({ ...modalErrors, confirmEmail: "" });
            }}
          />
        </AccountModal>
      )}
      {activeModal === "password" && (
        <AccountModal
          title="Change password"
          description="Choose a new password for your candidate account."
          onClose={closeModal}
          onSubmit={handlePasswordUpdate}
          submitLabel="Update Password"
        >
          <ModalField
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            error={modalErrors.currentPassword}
            onChange={(value) => {
              setPasswordForm({ ...passwordForm, currentPassword: value });
              setModalErrors({ ...modalErrors, currentPassword: "" });
            }}
          />
          <ModalField
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            error={modalErrors.newPassword}
            onChange={(value) => {
              setPasswordForm({ ...passwordForm, newPassword: value });
              setModalErrors({ ...modalErrors, newPassword: "" });
            }}
          />
          <ModalField
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            error={modalErrors.confirmPassword}
            onChange={(value) => {
              setPasswordForm({ ...passwordForm, confirmPassword: value });
              setModalErrors({ ...modalErrors, confirmPassword: "" });
            }}
          />
        </AccountModal>
      )}
    </CandidateLayout>
  );
}

function AccountModal({ title, description, onClose, onSubmit, submitLabel, children }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="account-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        aria-labelledby="account-modal-title"
        aria-modal="true"
        className="account-modal"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="account-modal-header">
          <div>
            <h2 id="account-modal-title">{title}</h2>
            <p>{description}</p>
          </div>
          <button type="button" className="modal-close-button" aria-label="Close dialog" onClick={onClose}>×</button>
        </div>
        <div className="account-modal-fields">{children}</div>
        <div className="account-modal-actions">
          <button type="button" className="modal-cancel-button" onClick={onClose}>Cancel</button>
          <button type="button" className="primary-action" onClick={onSubmit}>{submitLabel}</button>
        </div>
      </div>
    </div>
  );
}

function ModalField({ label, type, value, error, onChange }) {
  return (
    <label className="modal-field">
      {label}
      <input
        type={type}
        value={value}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <span className="modal-field-error" role="alert">{error}</span>}
    </label>
  );
}

function SettingToggle({ label, description, checked, disabled, onChange }) {
  return (
    <label className="setting-toggle">
      <span><strong>{label}</strong><small>{description}</small></span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} />
      <span className="toggle-track" aria-hidden="true"><span /></span>
    </label>
  );
}

export default Settings;
