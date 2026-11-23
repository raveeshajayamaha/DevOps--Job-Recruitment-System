import { useCallback, useEffect, useState } from "react";
import { getProfile, updateProfile } from "../../services/profileService";
import CandidateLayout from "./candidateLayout";

const emptyProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  skills: "",
  education: "",
  experience: "",
};

function normalizeProfile(profile = {}) {
  return Object.fromEntries(
    Object.keys(emptyProfile).map((field) => [field, profile[field] ?? ""]),
  );
}

function getInitials(profile) {
  const initials = `${profile.firstName.trim().charAt(0)}${profile.lastName.trim().charAt(0)}`;
  return initials || "C";
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "Size unavailable";
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUpdatedAt(value) {
  if (!value) return "Update date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Update date unavailable"
    : `Updated ${date.toLocaleDateString()}`;
}

function Profile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadProfile = useCallback(async (signal) => {
    try {
      const data = await getProfile(signal);
      setProfile(normalizeProfile(data?.profile));
      setResume(data?.resume ?? null);
      setError("");
      setLoadFailed(false);
      setSaved(false);
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        setLoadFailed(true);
        setError(requestError.message || "Unable to load your profile. Please try again.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  const retryLoad = () => {
    setLoading(true);
    setError("");
    setLoadFailed(false);
    setSaved(false);
    loadProfile();
  };

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) loadProfile(controller.signal);
    });
    return () => controller.abort();
  }, [loadProfile]);

  const updateField = (event) => {
    setSaved(false);
    setError("");
    setLoadFailed(false);
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    const fields = Object.fromEntries(
      ["firstName", "lastName", "phone", "location", "summary", "skills", "education", "experience"]
        .map((field) => [field, profile[field]]),
    );

    try {
      const updatedProfile = await updateProfile(fields);
      setProfile(normalizeProfile(updatedProfile));
      setSaved(true);
    } catch (requestError) {
      setError(requestError.message || "Unable to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CandidateLayout title="My Profile" eyebrow="Candidate profile">
      <form className="candidate-profile-form" onSubmit={handleSave}>
        {loading && <p className="profile-feedback" role="status">Loading your profile…</p>}
        {error && (
          <div className="profile-feedback profile-feedback-error" role="alert">
            <span>{error}</span>
            {loadFailed && !loading && (
              <button className="profile-retry-action" onClick={retryLoad} type="button">
                Try again
              </button>
            )}
          </div>
        )}

        <section className="candidate-card profile-overview">
          <div className="large-profile-avatar">{getInitials(profile)}</div>
          <div>
            <h2>{`${profile.firstName} ${profile.lastName}`.trim() || "Candidate profile"}</h2>
            <p>{profile.email || "Email unavailable"}</p>
            <span className="profile-completion">Candidate profile</span>
          </div>
          <span className="profile-status">Profile details</span>
        </section>

        <section className="candidate-card">
          <div className="candidate-card-heading">
            <div>
              <h2>Personal information</h2>
              <p>Keep your contact details up to date for recruiters.</p>
            </div>
          </div>
          <div className="profile-fields">
            <label>First Name<input name="firstName" value={profile.firstName} onChange={updateField} disabled={loading || loadFailed || saving} /></label>
            <label>Last Name<input name="lastName" value={profile.lastName} onChange={updateField} disabled={loading || loadFailed || saving} /></label>
            <label>Email<input type="email" value={profile.email} readOnly aria-describedby="profile-email-help" /></label>
            <label>Phone Number<input name="phone" value={profile.phone} onChange={updateField} disabled={loading || loadFailed || saving} /></label>
            <label className="field-full">Location<input name="location" value={profile.location} onChange={updateField} disabled={loading || loadFailed || saving} /></label>
          </div>
          <p className="profile-email-help" id="profile-email-help">Email changes are managed in account settings.</p>
        </section>

        <section className="candidate-card">
          <div className="candidate-card-heading">
            <div>
              <h2>Professional background</h2>
              <p>Showcase the experience and skills that make you stand out.</p>
            </div>
          </div>
          <div className="profile-fields">
            <label className="field-full">Professional Summary<textarea name="summary" rows="4" value={profile.summary} onChange={updateField} disabled={loading || loadFailed || saving} /></label>
            <label className="field-full">Skills<input name="skills" value={profile.skills} onChange={updateField} disabled={loading || loadFailed || saving} /></label>
            <label className="field-full">Education<textarea name="education" rows="3" value={profile.education} onChange={updateField} disabled={loading || loadFailed || saving} /></label>
            <label className="field-full">Experience<textarea name="experience" rows="3" value={profile.experience} onChange={updateField} disabled={loading || loadFailed || saving} /></label>
          </div>
        </section>

        <section className="candidate-card resume-card">
          <div>
            <h2>Resume / CV</h2>
            <p>{resume ? "Your resume is ready to share with employers." : "No resume has been uploaded yet."}</p>
          </div>
          <div className="resume-file">
            <span className="resume-icon" aria-hidden="true">📄</span>
            <div>
              <strong>{resume?.name || "No resume uploaded"}</strong>
              <span>{resume ? `${formatUpdatedAt(resume.updatedAt)} · ${formatFileSize(resume.size)}` : "Upload a resume to share it with employers."}</span>
            </div>
            <button type="button" className="resume-action" disabled={!resume}>Replace</button>
          </div>
        </section>

        <div className="profile-form-actions">
          {saved && <span className="save-message" role="status">Changes saved successfully.</span>}
          <button type="submit" className="primary-action" disabled={loading || loadFailed || saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </CandidateLayout>
  );
}

export default Profile;
