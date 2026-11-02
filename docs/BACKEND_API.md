# Implemented backend API

Base URL: `http://localhost:5000/api`, configured through frontend `VITE_API_URL`.
All resource endpoints require `Authorization: Bearer <token>` and trust the current database role.
Errors return `{ "success": false, "message": "..." }`.

## Existing core (preserved)

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET /jobs`, `GET /jobs/my`, `POST /jobs`, `GET /jobs/:id`, `PUT /jobs/:id`, `PATCH /jobs/:id/status`, `DELETE /jobs/:id`
- `POST /applications`, `GET /applications/my`, `GET /applications/recruiter`, `GET /applications/:id`, `PATCH /applications/:id/status`
- `POST /interviews`, `GET /interviews/my`, `GET /interviews/recruiter`, `GET /interviews/:id`, `PATCH /interviews/:id`, `PATCH /interviews/:id/status`

Public registration accepts candidate/recruiter only. Passwords use bcrypt and JWTs expire after one hour.
Inactive users cannot log in or reuse existing tokens. Legacy users without a stored status remain active.
Candidate applications survive deleted jobs with the existing unavailable-job fallback.
The unique candidate/job index rejects duplicate applications. Successful creation atomically increments the job counter using `$inc`; rejected requests and duplicates leave it unchanged.
No application deletion/withdrawal endpoint exists.

## Admin (database admin role only)

| Method | Path | Response / filters |
| --- | --- | --- |
| GET | `/admin/dashboard` | `dashboard`: totals, role/status counts, latest 10 activity records |
| GET | `/admin/users` | `users`; search, role, status |
| GET | `/admin/users/:id` | `user`: public account details, never password/preferences |
| GET | `/admin/jobs` | `jobs`; search, status, jobType |
| GET | `/admin/jobs/:id` | `job` |
| GET | `/admin/applications` | `applications`; search, status |
| GET | `/admin/applications/:id` | `application` |
| GET | `/admin/activity-logs` | `activities`; search, category, actor (ObjectId), days (7 or 30) |

Lists include `total`, `page` and `limit`; page defaults to 1, limit to 100, maximum 100.
Results are newest first with ID tie breaking. Searches treat regex metacharacters literally.
User roles are candidate/recruiter/admin; status active/inactive. Job status active/closed.
Application status pending/shortlisted/interview/rejected.
Activity category User/Job/Application/Interview; timestamps and derived date/time fields are UTC.
There are no API endpoints to create/edit/delete audit records, moderate jobs, or deactivate users because the existing admin UI is read-only.
Admins must be privately provisioned; no production account or password is seeded.

## Current profile, preferences, and credentials

| Method | Path | Body / response |
| --- | --- | --- |
| GET | `/profile` | `profile` and nullable `resume` metadata |
| PATCH | `/profile` | editable profile fields; returns `profile` |
| GET | `/profile/settings` | current role's `settings` |
| PATCH | `/profile/settings` | partial preferences; returns `settings` |
| PATCH | `/profile/account` | currentPassword plus email and/or newPassword + confirmPassword; returns updated `profile` and replacement `token` |
| PUT | `/profile/resume` | candidate only; raw application/pdf bytes, X-Filename header; returns `resume` metadata |
| GET | `/profile/resume/:candidateId` | private PDF attachment, never a public URL |

Profile name fields: firstName/lastName (1-100 characters).
Candidate fields: phone (50), location (200), summary (5000), skills (comma-separated text, 2000), education (5000), experience (5000).
Recruiter fields: phone (50), location (200), jobTitle (200), company (200), professionalSummary (5000).
Role, status, owner, password, and email cannot be changed through profile updates.
Email/password updates require the current password, reject duplicate emails, and revoke prior tokens with a stored token version.
Candidate preferences: recommendations/applications/interviews booleans and visibility Public/Recruiters only/Private.
Recruiter preferences: emailNotifications/interviewReminders/applicationNotifications/jobPostingNotifications/compactView booleans.

Resumes are one PDF per candidate, maximum 2 MiB, stored in MongoDB separately from user records.
Uploads validate extension, MIME, PDF signature and EOF; filenames are bounded safe ASCII.
Downloads require the owner, admin, or recruiter with an application from that candidate to one of their current jobs.
They use attachment, no-store and nosniff headers. PDFs are not served inline or executed.
Updating a resume replaces that candidate's existing file.
Profile privacy does not hide information deliberately shared through an application; no public profile directory exists.

## Scope and operational limits

- Static career advice remains frontend content. Old fixture files are retained but active application pages/services no longer import them.
- Admin platform/theme settings are explicitly a visual preview with no application-wide consumer. No unused global settings model is introduced. Candidate account deletion stays disabled as an explicitly labelled preview.
- Notification preferences persist; this application has no email/SMS delivery service or in-app notification/message API. Placeholder notification counts were removed.
- Logout clears this browser's token. Credential changes revoke old tokens; ordinary logout does not revoke copied tokens on another device.
- Local standalone MongoDB uses an application write followed by an atomic counter increment, with compensating application deletion if the increment fails. A process/database crash between those writes can leave a stale counter. Replica-set transactions or an operational reconciliation job are needed for crash-atomic cross-document counts.
- Activity logging is awaited but best effort after successful business mutations. Log storage failure is reported to server stderr without falsely marking a successful mutation as failed. Compliance-grade atomic audit persistence is not provided.
- Resume validation is structural/file-type validation, not malware scanning. Production deployments should add document scanning, TLS, backups, authentication throttling, and deployment monitoring as appropriate.
- Existing counters are not automatically backfilled: historical records must be reconciled under an explicit maintenance window to avoid racing live applications. No real records were migrated or deleted by this implementation.
