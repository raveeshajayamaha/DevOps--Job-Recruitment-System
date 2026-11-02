# Backend completion audit

Existing auth, job, application and interview routes and integration contracts will be preserved.

- Admin dashboard, users, jobs, applications and activity pages use sample records; add authenticated admin read/search/filter/detail APIs and connect these pages. No existing activate/deactivate or job moderation controls require write APIs.
- Admin general settings are explicitly a view-only preview with no platform consumer; do not invent global configuration. Replace sample account information with the authenticated account.
- Candidate and recruiter profiles need validated persistence. Candidate CV Replace is currently inert; provide a private, size-limited PDF resume upload/download with owner and application recruiter access.
- Candidate preferences and recruiter preferences are temporary. Persist only their existing fields. Candidate email/password actions need real account updates. Account deletion is explicitly preview-only and will not be implemented as an unrequested destructive operation.
- Candidate recent applications and recruiter pipeline/KPIs/interviews/activity use mocks; derive from existing APIs. Static career advice/resources and enum/navigation arrays are content, not missing APIs.
- Application creation currently omits applicantsCount. Add atomic increment only after unique application creation, compensation on counter failure, and concurrent integration checks. No withdrawal/deletion endpoint exists.
- Add indexed activity records without credentials, with admin-only read access and no mutation endpoints.
- Preserve current database-role JWT checks and existing integration suites. Add profile/admin/activity/resume/account tests, aggregate npm test, and run frontend lint/build.
- Check input allowlists, enum/query validation, safe errors, inactive accounts and token revocation after password changes.
- Keep VITE_API_URL, Express 5, Mongoose 9 and ES modules. No commits or pushes.
