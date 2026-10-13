import { useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { getJobById, updateJob } from "../../services/jobService";
import "./postJob.css";
import "./editJob.css";

const emptyForm = {
  title: "",
  company: "",
  location: "",
  type: "Full-time",
  salaryMinimum: "",
  salaryMaximum: "",
  experienceLevel: "Entry Level",
  description: "",
  requirements: "",
  skills: "",
  deadline: "",
};

const sidebarItems = [
  { label: "Dashboard", icon: "⌂", to: "/recruiter/dashboard", end: true },
  { label: "Post Job", icon: "+", to: "/recruiter/jobs/new", end: true },
  { label: "Manage Jobs", icon: "▣", to: "/recruiter/jobs" },
  { label: "Applications", icon: "✓", to: "/recruiter/applications" },
  { label: "Interviews", icon: "◷", to: "/recruiter/interviews" },
  { label: "Profile", icon: "◎", to: "/recruiter/profile" },
  { label: "Settings", icon: "⚙", to: "/recruiter/settings" },
];

function EditJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const job = getJobById(jobId);
  const [form, setForm] = useState(() => job ? toForm(job) : emptyForm);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  if (!job) {
    return (
      <div className="post-job-page">
        <RecruiterSidebar />
        <main className="post-job-main">
          <header className="post-job-header">
            <div>
              <p className="post-job-eyebrow">Recruiter workspace</p>
              <h1>Edit Job</h1>
              <p className="post-job-header-description">Update your job posting details.</p>
            </div>
          </header>
          <div className="post-job-content">
            <div className="post-job-card edit-job-not-found" role="alert">
              <strong>Job not found</strong>
              <span>The requested job posting could not be found.</span>
              <NavLink className="post-job-primary-button" to="/recruiter/jobs">
                Back to Manage Jobs
              </NavLink>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setErrors((currentErrors) => {
      if (!currentErrors[name]) return currentErrors;
      const nextErrors = { ...currentErrors };
      delete nextErrors[name];
      return nextErrors;
    });
    setSuccess("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSuccess("");
      return;
    }

    const updatedJob = updateJob(jobId, toJobData(form, job));
    if (!updatedJob) {
      setErrors({ form: "Unable to update this job. Please try again." });
      return;
    }

    setSuccess("Job updated successfully. Returning to Job Details...");
    window.setTimeout(() => navigate(`/recruiter/jobs/${jobId}`), 600);
  };

  return (
    <div className="post-job-page">
      <RecruiterSidebar />
      <main className="post-job-main">
        <header className="post-job-header">
          <div>
            <p className="post-job-eyebrow">RECRUITER WORKSPACE</p>
            <h1>Edit Job</h1>
            <p className="post-job-header-description">Update your job posting details.</p>
          </div>
          <div className="post-job-header-actions">
            <button aria-label="Notifications" className="post-job-icon-button" type="button">
              🔔<span>3</span>
            </button>
            <div className="post-job-avatar">AR</div>
            <div className="post-job-profile-label">
              <strong>Alex R.</strong>
              <span>Hiring Manager</span>
            </div>
          </div>
        </header>

        <div className="post-job-content">
          <NavLink className="post-job-back-link" to={`/recruiter/jobs/${jobId}`}>
            ← Back to Job Details
          </NavLink>
          <form className="post-job-card" onSubmit={handleSubmit} noValidate>
            <div className="post-job-card-header">
              <div>
                <h2>Job Information</h2>
                <p>Update the details candidates need to understand the role.</p>
              </div>
              <span className="post-job-required-note">* Required fields</span>
            </div>

            <div className="post-job-form-grid">
              <FormField error={errors.title} htmlFor="edit-job-title" label="Job Title" required>
                <input id="edit-job-title" name="title" onChange={handleChange} value={form.title} />
              </FormField>
              <FormField error={errors.company} htmlFor="edit-company" label="Company" required>
                <input id="edit-company" name="company" onChange={handleChange} value={form.company} />
              </FormField>
              <FormField error={errors.location} htmlFor="edit-location" label="Location" required>
                <input id="edit-location" name="location" onChange={handleChange} value={form.location} />
              </FormField>
              <FormField error={errors.type} htmlFor="edit-job-type" label="Job Type" required>
                <select id="edit-job-type" name="type" onChange={handleChange} value={form.type}>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
              </FormField>

              <div className="post-job-field post-job-salary-field">
                <span className="post-job-label">Salary Range</span>
                <div className="post-job-salary-grid">
                  <FormField error={errors.salaryMinimum} htmlFor="edit-salary-minimum" label="Minimum">
                    <input id="edit-salary-minimum" min="0" name="salaryMinimum" onChange={handleChange} type="number" value={form.salaryMinimum} />
                  </FormField>
                  <FormField error={errors.salaryMaximum} htmlFor="edit-salary-maximum" label="Maximum">
                    <input id="edit-salary-maximum" min="0" name="salaryMaximum" onChange={handleChange} type="number" value={form.salaryMaximum} />
                  </FormField>
                </div>
              </div>

              <FormField error={errors.experienceLevel} htmlFor="edit-experience-level" label="Experience Level" required>
                <select id="edit-experience-level" name="experienceLevel" onChange={handleChange} value={form.experienceLevel}>
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                </select>
              </FormField>
              <FormField className="post-job-full-width" error={errors.description} htmlFor="edit-description" label="Job Description" required>
                <textarea id="edit-description" name="description" onChange={handleChange} value={form.description} />
              </FormField>
              <FormField className="post-job-full-width" error={errors.requirements} htmlFor="edit-requirements" label="Requirements" required>
                <textarea id="edit-requirements" name="requirements" onChange={handleChange} value={form.requirements} />
              </FormField>
              <FormField className="post-job-full-width" error={errors.skills} htmlFor="edit-skills" label="Required Skills" required>
                <input id="edit-skills" name="skills" onChange={handleChange} value={form.skills} />
              </FormField>
              <FormField error={errors.deadline} htmlFor="edit-deadline" label="Application Deadline" required>
                <input id="edit-deadline" name="deadline" onChange={handleChange} type="date" value={form.deadline} />
              </FormField>
            </div>

            {errors.form && <div className="post-job-error edit-job-form-error">{errors.form}</div>}
            {success && <div className="post-job-success" role="status"><strong>{success}</strong></div>}

            <div className="post-job-actions">
              <button className="post-job-secondary-button" onClick={() => navigate(`/recruiter/jobs/${jobId}`)} type="button">
                Cancel
              </button>
              <button className="post-job-primary-button" type="submit">Save Changes</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function toForm(job) {
  return {
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.jobType,
    salaryMinimum: String(job.salaryMin),
    salaryMaximum: String(job.salaryMax),
    experienceLevel: job.experienceLevel,
    description: job.description,
    requirements: job.requirements.join(", "),
    skills: job.skills.join(", "),
    deadline: job.deadline,
  };
}

function toJobData(form, job) {
  return {
    title: form.title.trim(),
    company: form.company.trim(),
    location: form.location.trim(),
    jobType: form.type,
    salaryMin: Number(form.salaryMinimum),
    salaryMax: Number(form.salaryMaximum),
    experienceLevel: form.experienceLevel,
    description: form.description.trim(),
    requirements: splitList(form.requirements),
    skills: splitList(form.skills),
    deadline: form.deadline,
    status: job.status,
    applicantsCount: job.applicantsCount,
    postedDate: job.postedDate,
  };
}

function validateForm(form) {
  const errors = {};
  const minimum = form.salaryMinimum.trim();
  const maximum = form.salaryMaximum.trim();

  if (!form.title.trim()) errors.title = "Job title is required.";
  if (!form.company.trim()) errors.company = "Company name is required.";
  if (!form.location.trim()) errors.location = "Location is required.";
  if (!form.type) errors.type = "Job type is required.";
  if (!form.description.trim()) errors.description = "Please provide a job description.";
  if (!splitList(form.requirements).length) errors.requirements = "Please provide at least one requirement.";
  if (!splitList(form.skills).length) errors.skills = "Please provide at least one skill.";
  if (!form.deadline) errors.deadline = "Application deadline is required.";
  if (minimum && !isValidSalary(minimum)) errors.salaryMinimum = "Minimum salary must be a valid number.";
  if (maximum && !isValidSalary(maximum)) errors.salaryMaximum = "Maximum salary must be a valid number.";
  if (minimum && maximum && isValidSalary(minimum) && isValidSalary(maximum) && Number(minimum) > Number(maximum)) {
    errors.salaryMaximum = "Maximum salary must be greater than or equal to minimum salary.";
  }

  return errors;
}

function FormField({ children, className = "", error, htmlFor, label, required = false }) {
  return (
    <div className={`post-job-field ${className}`}>
      <label className="post-job-label" htmlFor={htmlFor}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      {children}
      {error && <span className="post-job-error">{error}</span>}
    </div>
  );
}

function RecruiterSidebar() {
  return (
    <aside className="post-job-sidebar">
      <div className="post-job-brand">
        <div className="post-job-brand-logo">💼</div>
        <div><strong>JobRecruit</strong><span>Recruiter Portal</span></div>
      </div>
      <nav className="post-job-navigation" aria-label="Recruiter navigation">
        {sidebarItems.map((item) => (
          <NavLink className={({ isActive }) => `post-job-nav-link${isActive ? " active" : ""}`} end={item.end} key={item.label} to={item.to}>
            <span className="post-job-nav-icon">{item.icon}</span><span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="post-job-sidebar-footer">
        <NavLink className="post-job-nav-link" to="/"><span className="post-job-nav-icon">↪</span><span>Logout</span></NavLink>
      </div>
    </aside>
  );
}

function isValidSalary(value) {
  return Number.isFinite(Number(value)) && Number(value) >= 0;
}

function splitList(value) {
  return value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
}

export default EditJob;
