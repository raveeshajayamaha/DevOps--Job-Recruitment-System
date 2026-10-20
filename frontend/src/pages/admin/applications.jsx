import { useEffect, useMemo, useRef, useState } from "react";
import sampleApplications from "../../data/recruiterApplications";
import AdminSidebar from "./AdminSidebar";
import { useAdminTheme } from "./AdminThemeContext";
import "./dashboard.css";
import "./applications.css";

const PAGE_SIZE = 6;
const supportedStatuses = ["pending", "shortlisted", "rejected"];

function formatDate(value, options = { year: "numeric", month: "short", day: "numeric" }) {
  if (!value) return "Not provided";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "Not provided" : date.toLocaleDateString("en", options);
}

function displayValue(value) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Not provided";
  return value === undefined || value === null || value === "" ? "Not provided" : value;
}

function AdminApplications() {
  const { theme } = useAdminTheme();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!selectedApplication) return undefined;
    modalRef.current?.focus();
    const handleKeyDown = (event) => { if (event.key === "Escape") setSelectedApplication(null); };
    document.addEventListener("keydown", handleKeyDown);
    return () => { document.removeEventListener("keydown", handleKeyDown); triggerRef.current?.focus(); };
  }, [selectedApplication]);

  const summary = useMemo(() => ({
    total: sampleApplications.length,
    pending: sampleApplications.filter((application) => application.status === "pending").length,
    shortlisted: sampleApplications.filter((application) => application.status === "shortlisted").length,
    rejected: sampleApplications.filter((application) => application.status === "rejected").length,
  }), []);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sampleApplications.filter((application) => {
      const matchesSearch = !query || [application.candidateName, application.email, application.jobTitle, application.company]
        .some((value) => String(value || "").toLowerCase().includes(query));
      return matchesSearch && (status === "all" || application.status === status);
    });
  }, [search, status]);
  const pageCount = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));
  const visibleApplications = filteredApplications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const updateFilter = (setter, value) => { setter(value); setPage(1); };

  return <div className="admin-dashboard" data-admin-theme={theme}>
    <AdminSidebar />
    <main className="admin-main">
      <header className="admin-topbar"><div className="admin-breadcrumb"><span>Workspace</span><span className="admin-breadcrumb-separator">/</span><strong>Application Management</strong></div><div className="admin-topbar-right"><span className="admin-demo-badge"><span/> Demo data</span><div className="admin-avatar" aria-label="Admin profile">AD</div></div></header>
      <div className="admin-content">
        <section className="admin-welcome"><div><p className="admin-eyebrow">ADMINISTRATION</p><h1>Application Management</h1><p className="admin-welcome-copy">Review applications from the local recruiter sample dataset.</p></div></section>
        <div className="admin-sample-notice" role="note"><span className="admin-notice-icon" aria-hidden="true">i</span><span><strong>Local sample data</strong> — these in-memory application records are for preview only.</span></div>
        <section className="admin-overview-grid admin-applications-summary" aria-label="Application statistics">
          {[["Total Applications", summary.total, "blue"], ["Pending", summary.pending, "amber"], ["Shortlisted", summary.shortlisted, "teal"], ["Rejected", summary.rejected, "rose"]].map(([label, value, tone]) => <article className="admin-stat-card" key={label}><div className={`admin-stat-icon ${tone}`} aria-hidden="true">{label === "Total Applications" ? "A" : label.charAt(0)}</div><div className="admin-stat-content"><span className="admin-stat-label">{label}</span><strong className="admin-stat-value">{value}</strong><span className="admin-applications-caption">Sample records</span></div></article>)}
        </section>
        <section className="admin-panel admin-applications-panel" aria-labelledby="admin-applications-title">
          <div className="admin-panel-heading"><div><h2 id="admin-applications-title">Applications</h2><p>Search and filter local application records.</p></div></div>
          <div className="admin-applications-filters">
            <label className="admin-applications-search"><span className="admin-sr-only">Search candidate, email, job, or company</span><span aria-hidden="true">⌕</span><input type="search" placeholder="Search candidate, email, job, or company" value={search} onChange={(event) => updateFilter(setSearch, event.target.value)}/></label>
            <label className="admin-applications-select"><span>Status</span><select value={status} onChange={(event) => updateFilter(setStatus, event.target.value)}><option value="all">All statuses</option>{supportedStatuses.map((value) => <option key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</option>)}</select></label>
          </div>
          {visibleApplications.length ? <>
            <div className="admin-applications-table-wrap"><table className="admin-applications-table"><thead><tr><th scope="col">Candidate</th><th scope="col">Job title</th><th scope="col">Company</th><th scope="col">Applied date</th><th scope="col">Status</th><th scope="col"><span className="admin-sr-only">Actions</span></th></tr></thead><tbody>{visibleApplications.map((application) => <tr key={application.id}><td><strong>{displayValue(application.candidateName)}</strong></td><td>{displayValue(application.jobTitle)}</td><td>{displayValue(application.company)}</td><td><time dateTime={application.appliedDate}>{formatDate(application.appliedDate)}</time></td><td><span className={`admin-application-status ${application.status}`}><span/>{application.status}</span></td><td><button className="admin-application-view" type="button" onClick={(event) => { triggerRef.current = event.currentTarget; setSelectedApplication(application); }}>View details</button></td></tr>)}</tbody></table></div>
            {filteredApplications.length > PAGE_SIZE && <div className="admin-applications-pagination"><span>Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filteredApplications.length)} of {filteredApplications.length} applications</span><div><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>Previous</button><span>Page {page} of {pageCount}</span><button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount}>Next</button></div></div>}
          </> : <div className="admin-applications-empty"><span aria-hidden="true">⌕</span><h3>No applications found</h3><p>Try another search or status.</p></div>}
        </section>
        <footer className="admin-footer">© 2026 JobRecruit <span>•</span> Admin application management preview</footer>
      </div>
    </main>
    {selectedApplication && <div className="admin-application-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedApplication(null); }}><section ref={modalRef} tabIndex={-1} className="admin-application-modal" role="dialog" aria-modal="true" aria-labelledby="admin-application-modal-title"><button className="admin-application-modal-close" type="button" onClick={() => setSelectedApplication(null)} aria-label="Close details">×</button><p className="admin-eyebrow">APPLICATION DETAILS</p><h2 id="admin-application-modal-title">{displayValue(selectedApplication.candidateName)}</h2><dl><div><dt>Email</dt><dd>{displayValue(selectedApplication.email)}</dd></div><div><dt>Job title</dt><dd>{displayValue(selectedApplication.jobTitle)}</dd></div><div><dt>Company</dt><dd>{displayValue(selectedApplication.company)}</dd></div><div><dt>Applied date</dt><dd>{formatDate(selectedApplication.appliedDate, { year: "numeric", month: "long", day: "numeric" })}</dd></div><div><dt>Status</dt><dd><span className={`admin-application-status ${selectedApplication.status}`}><span/>{displayValue(selectedApplication.status)}</span></dd></div><div><dt>Experience</dt><dd>{displayValue(selectedApplication.experience)}</dd></div><div><dt>Skills</dt><dd>{displayValue(selectedApplication.skills)}</dd></div><div><dt>Resume</dt><dd>{displayValue(selectedApplication.resume)}</dd></div></dl><button className="admin-application-modal-done" type="button" onClick={() => setSelectedApplication(null)}>Close</button></section></div>}
  </div>;
}

export default AdminApplications;
