# JobRecruit backend

Existing Express 5 / Mongoose 9 / ES module backend with JWT authentication, jobs, applications, multiple interview rounds, admin read APIs, profiles, preferences, private PDF resumes, and activity records.

## Run locally

Use a Node version compatible with the installed Mongoose/Express versions and an available MongoDB instance. From the repository root in PowerShell:

```powershell
# If MongoDB is not already running (may require an Administrator terminal):
Start-Service MongoDB
cd backend
npm ci
# Only if .env does not exist:
Copy-Item .env.example .env
```

Set backend `.env` values for `PORT`, `MONGODB_URI`, `FRONTEND_URL`, and a private `JWT_SECRET` of at least 32 bytes. Never commit `.env` or credentials. Do not overwrite an existing configured `.env`.

```powershell
npm start
```

In a second terminal:

```powershell
cd frontend
npm ci
npm run dev
```

`VITE_API_URL` defaults to `http://localhost:5000/api`. Set it in frontend `.env` if necessary and restart Vite.
The frontend origin must match backend `FRONTEND_URL`.

## Verification

Keep the backend running with the same database and secret used by the tests:

```powershell
Invoke-WebRequest http://localhost:5000/
Invoke-RestMethod http://localhost:5000/api/test
cd backend
npm run test:auth
npm run test:jobs
npm run test:applications
npm run test:interviews
npm run test:admin
npm run test:profile
npm test
cd ../frontend
npm run lint
npm run build
cd ..
git diff --check
```

Tests use unique temporary records and finally cleanup restricted to those accounts and their jobs/applications/interviews/resumes/activity records. Never run these against a production environment. Existing suite-specific URL overrides remain supported. `API_TEST_URL` selects the admin/profile test API base; it must point to the database and JWT secret in backend `.env`.

No public admin registration or seeded admin password exists. Provision trusted admin accounts privately.
No commit or push is performed.

See [implemented API and operational limitations](../docs/BACKEND_API.md) and [audit checklist](../docs/BACKEND_AUDIT.md). The older API_CONTRACT.md is a historical proposal, not the current contract.
