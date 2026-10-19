# JobRecruit backend

Requires Node.js, npm, and local MongoDB. From the project root, start the backend:

```powershell
cd backend
npm install
npm run dev
```

In another terminal start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Backend configuration is read from backend/.env. Use .env.example as a template.
Set MONGODB_URI=mongodb://127.0.0.1:27017/job_recruitment_system,
FRONTEND_URL=http://localhost:5173, PORT=5000, and a private random JWT_SECRET
of at least 32 bytes. A secret was generated for this local installation.
Never commit .env. The server validates the secret, connects to MongoDB, and
initializes the unique email index before accepting requests.

Frontend VITE_API_URL defaults to http://localhost:5000/api. If using another
backend address, set it in frontend/.env and restart Vite.
Use the frontend origin configured in FRONTEND_URL.

## Register, inspect, and log in

1. Open http://localhost:5173/register.
2. Enter first name, last name, email, password, matching password confirmation,
   and Candidate or Recruiter. Passwords need at least 8 characters and at most
   72 UTF-8 bytes. Names can be up to 100 characters; email up to 254.
3. Click Create Account. Success saves the account and sends you to /login.
4. In MongoDB Compass connect to mongodb://127.0.0.1:27017.
   Refresh, open job_recruitment_system, then users.
   Filter with {"email":"your-email@example.com"} using the lowercase email.
   Inspect firstName, lastName, email, role, createdAt and updatedAt.
   password contains a bcrypt hash, never the plaintext password.
   confirmPassword is validated but never saved. The Indexes tab includes
   the unique email_1 index.
5. Open http://localhost:5173/login and enter the registered email and password.
   Successful login opens /home. Protected job pages use the verified database
   role regardless of the login Account Type selector.
6. Existing Candidate and Recruiter Logout links clear the browser session.
   JWTs expire after one hour; closing the browser tab clears session storage.
   Expired tokens redirect to login when a protected route is checked.

All existing Candidate, Recruiter and Admin URLs remain present and require a
verified session with the corresponding database role. /dashboard is a Candidate
alias. /admin/login authenticates existing privately provisioned Admin accounts.
Public registration rejects Admin roles. No Admin accounts are seeded.

## API contract

All errors use {"success":false,"message":"..."}.

- GET /api/test: database health.
- POST /api/auth/register: JSON firstName, lastName, email, password,
  confirmPassword, role (candidate or recruiter only).
  201 returns success, message, user; no automatic login.
  400 invalid fields; 409 duplicate normalized email.
- POST /api/auth/login: JSON email and password.
  200 returns success, message, token and user.
  400 malformed input; 401 incorrect credentials.
- GET /api/auth/me: Authorization: Bearer <token>.
  200 returns success and the current database user.
  401 missing, invalid, expired token or deleted account.

Public user objects include id, firstName, lastName, email, role.
Passwords never appear in responses. JWTs use HS256, explicit issuer and audience,
and expire after one hour. authenticate middleware verifies JWTs and loads the
current account; authorize(...roles) enforces database roles for future APIs.
Future sensitive APIs must use both middleware functions as appropriate.

## Verification

With the backend running against the same backend/.env database and secret:

```powershell
cd backend
npm run test:auth
cd ../frontend
npm run build
```

The integration test writes randomly named accounts, checks persistence and
authentication failures, and removes only those accounts in finally.
AUTH_TEST_URL can select another API base, but it must use the same database
and JWT secret as the test configuration.

## Remaining scope

Job management is connected to MongoDB. Applications, Interviews and Admin Job
Management remain sample screens; their APIs are outside this task.
Password reset, email verification, rate limiting, refresh tokens and server-side
token revocation are not implemented. Logout removes the token from sessionStorage;
an already copied token remains valid until expiry. Session storage is readable
by JavaScript, so production deployment requires XSS hardening and HTTPS, or a
dedicated secure-cookie session design.


## Job management

Jobs are stored in the MongoDB `jobs` collection. The Job model includes title,
company, location, jobType, salaries, experienceLevel, description, requirement
and skill arrays, status, applicantsCount, postedDate, deadline, recruiter and
createdAt/updatedAt timestamps. Applicants start at zero; ownership and postedDate
are server-controlled. Identical job titles are allowed; MongoDB IDs identify jobs.

All job endpoints require the existing Bearer JWT:

| Method | Path | Access |
| --- | --- | --- |
| GET | /api/jobs | Active jobs; filters: search (title/company), location, jobType |
| GET | /api/jobs/my | Current recruiter's jobs, including closed jobs |
| GET | /api/jobs/:jobId | Candidates: active jobs; recruiters: own jobs |
| POST | /api/jobs | Recruiters only; owner comes from authenticated account |
| PUT | /api/jobs/:jobId | Owning recruiter only |
| PATCH | /api/jobs/:jobId/status | Owning recruiter; active or closed |
| DELETE | /api/jobs/:jobId | Owning recruiter only |

Lists return `{success:true,jobs:[...]}` and create/read/update return
`{success:true,job:{...}}`. Job responses include both `id` and `_id`, with
postedDate/deadline as YYYY-MM-DD. The frontend service derives the existing
candidate `type` and formatted `salary` display fields. No live job page uses
fixture fallback storage.

The existing forms remain at /recruiter/jobs/new and /recruiter/jobs/:jobId/edit.
Manage Jobs at /recruiter/jobs loads only the signed-in recruiter's jobs and
calculates its summaries from those records. Candidate search and detail views
load MongoDB jobs. Search is debounced and filtered on the server. API errors
appear within the existing layouts; invalid sessions clear the JWT and open login.
The recruiter dashboard's job list loads owned jobs, and candidate dashboard
recommendations load active jobs, without changing either layout. Other dashboard
metrics remain their existing samples.

Manual check: log in as recruiter, publish a job, open Manage Jobs, refresh,
view/edit the job, and refresh again. Then log in as candidate and search by title,
company, location and job type, open View Job, and confirm its details. Apply Now
remains a visual control; no Application API is implemented. Logout must prevent
access to recruiter job routes. A second recruiter must receive access denied
when opening the first recruiter's job edit URL.

Run repeatable API, MongoDB and frontend service tests with the backend running:

```powershell
cd backend
npm run test:jobs
```

For optional browser form tests using headless Microsoft Edge, install Playwright
in a temporary folder (no project dependency changes):

```powershell
npm install --prefix "$env:TEMP/jobrecruit-browser-check" --no-package-lock playwright
$env:JOB_BROWSER_MODULE = "$env:TEMP/jobrecruit-browser-check/node_modules/playwright/index.mjs"
npm run test:jobs
```

Both backend and frontend must be running. The tests create unique candidate and
recruiter accounts and remove only their own jobs/accounts in finally. JOB_TEST_URL
and JOB_TEST_FRONTEND_URL override the default localhost URLs; the API must use
the same database and JWT secret as backend/.env.
