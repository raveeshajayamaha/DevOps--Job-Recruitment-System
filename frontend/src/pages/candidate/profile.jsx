import { useState } from "react";
import CandidateLayout from "./candidateLayout";

const initialProfile = {
  firstName: "Alex",
  lastName: "Perera",
  email: "alex.perera@example.com",
  phone: "+94 77 123 4567",
  location: "Colombo, Sri Lanka",
  summary:
    "Product-minded frontend developer with a passion for building accessible, user-friendly experiences and solving meaningful problems with thoughtful technology.",
  skills: "React, JavaScript, HTML, CSS, Git, Figma",
  education: "BSc in Information Technology — University of Colombo, 2022",
  experience: "Frontend Developer at TechNova — 2022 to Present",
};

function Profile() {
  const [profile, setProfile] = useState(initialProfile);
  const [saved, setSaved] = useState(false);

  const updateField = (event) => {
    setSaved(false);
    setProfile({ ...profile, [event.target.name]: event.target.value });
  };

  const handleSave = (event) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <CandidateLayout title="My Profile" eyebrow="Candidate profile">
      <form className="candidate-profile-form" onSubmit={handleSave}>
        <section className="candidate-card profile-overview">
          <div className="large-profile-avatar">AP</div>
          <div>
            <h2>{profile.firstName} {profile.lastName}</h2>
            <p>{profile.email}</p>
            <span className="profile-completion">Profile visibility: Public</span>
          </div>
          <span className="profile-status">Available for opportunities</span>
        </section>

        <section className="candidate-card">
          <div className="candidate-card-heading">
            <div>
              <h2>Personal information</h2>
              <p>Keep your contact details up to date for recruiters.</p>
            </div>
          </div>
          <div className="profile-fields">
            <label>First Name<input name="firstName" value={profile.firstName} onChange={updateField} /></label>
            <label>Last Name<input name="lastName" value={profile.lastName} onChange={updateField} /></label>
            <label>Email<input type="email" name="email" value={profile.email} onChange={updateField} /></label>
            <label>Phone Number<input name="phone" value={profile.phone} onChange={updateField} /></label>
            <label className="field-full">Location<input name="location" value={profile.location} onChange={updateField} /></label>
          </div>
        </section>

        <section className="candidate-card">
          <div className="candidate-card-heading">
            <div>
              <h2>Professional background</h2>
              <p>Showcase the experience and skills that make you stand out.</p>
            </div>
          </div>
          <div className="profile-fields">
            <label className="field-full">Professional Summary<textarea name="summary" rows="4" value={profile.summary} onChange={updateField} /></label>
            <label className="field-full">Skills<input name="skills" value={profile.skills} onChange={updateField} /></label>
            <label className="field-full">Education<textarea name="education" rows="3" value={profile.education} onChange={updateField} /></label>
            <label className="field-full">Experience<textarea name="experience" rows="3" value={profile.experience} onChange={updateField} /></label>
          </div>
        </section>

        <section className="candidate-card resume-card">
          <div>
            <h2>Resume / CV</h2>
            <p>Your resume is ready to share with employers.</p>
          </div>
          <div className="resume-file">
            <span className="resume-icon">📄</span>
            <div><strong>Alex_Perera_Resume.pdf</strong><span>Updated 12 May 2025 · 1.2 MB</span></div>
            <button type="button" className="resume-action">Replace</button>
          </div>
        </section>

        <div className="profile-form-actions">
          {saved && <span className="save-message" role="status">Changes saved successfully.</span>}
          <button type="submit" className="primary-action">Save Changes</button>
        </div>
      </form>
    </CandidateLayout>
  );
}

export default Profile;
