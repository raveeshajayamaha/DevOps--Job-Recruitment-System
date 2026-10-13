# API Contract: DevOps-Enabled Job Recruitment & Applicant Tracking System

**Status:** Proposed contract for future backend implementation
**Repository source of truth inspected:** `frontend/src` and `frontend/package.json`
**Scope:** Candidate and Recruiter requirements plus proposed Admin read-only APIs

No endpoint described in this document currently exists. This document does not implement a backend, database schema, HTTP client, authentication, or frontend integration.

Labels used throughout:

- **VERIFIED IN CURRENT CODE** — observed in the current frontend repository.
- **PROPOSED API CONTRACT** — behavior recommended for the future backend.
- **DECISION REQUIRED** — an item the backend/product team must confirm before implementation.

## 1. Purpose and scope

### VERIFIED IN CURRENT CODE

The application is a React + Vite frontend. `frontend/package.json` contains React, React DOM, React Router DOM, Vite, and ESLint dependencies, but no HTTP client or API SDK. Recruiter services currently read and mutate in-memory JavaScript mock data.

Current recruiter routes include:

- `/recruiter/dashboard`
- `/recruiter/jobs`, `/recruiter/jobs/new`, `/recruiter/jobs/:jobId`, and `/recruiter/jobs/:jobId/edit`
- `/recruiter/applications` and `/recruiter/applications/:applicationId`
- `/recruiter/interviews`, `/recruiter/interviews/:interviewId`, and `/recruiter/interviews/schedule/:applicationId`
- `/recruiter/profile`
- `/recruiter/settings`

Candidate screens consume separate mock job, application, and interview data. `frontend/src/App.jsx` is the route source of truth.

### PROPOSED API CONTRACT

The proposed API uses JSON over HTTP under the fixed base path `/api/v1`. Public resource identifiers are opaque strings, such as `job_123`, `application_123`, `interview_123`, `candidate_123`, and `recruiter_123`. The format is illustrative; clients must not infer database type, sequence, or storage technology from an ID.

Recruiter endpoints are scoped to the authenticated recruiter and any organization/team authorization established by the backend. A client-supplied recruiter ID is not trusted for ordinary recruiter operations.

### DECISION REQUIRED

The backend team must confirm the authentication provider, recruiter/company tenancy model, role names, and whether candidate-facing endpoints will be delivered by this service. Authentication is not implemented by the current frontend or by this contract.

## 2. Current repository findings

### VERIFIED IN CURRENT CODE

Relevant mock data files:

- `frontend/src/data/recruiterJobs.js`
- `frontend/src/data/recruiterApplications.js`
- `frontend/src/data/recruiterInterviews.js`
- `frontend/src/data/recruiterDashboard.js`
- `frontend/src/data/recruiterProfile.js`
- `frontend/src/data/recruiterSettings.js`
- `frontend/src/data/jobs.js`
- `frontend/src/data/applications.js`
- `frontend/src/data/interviews.js`

Relevant service files:

- `frontend/src/services/jobService.js`
- `frontend/src/services/applicationService.js`
- `frontend/src/services/interviewService.js`
- `frontend/src/services/recruiterProfileService.js`
- `frontend/src/services/recruiterSettingsService.js`
- `frontend/src/services/candidateData.js`

The recruiter services do not call `fetch`, Axios, or another transport. They clone and mutate module-local mock data. Missing records generally return `undefined` or `false`; validation is mainly performed by page components. The static dashboard mock totals are not calculated from the job, application, and interview mock collections.

## 3. Authentication, authorization, and common conventions

### PROPOSED API CONTRACT

Until the backend team confirms another mechanism, the proposed contract assumes:

```http
Authorization: Bearer <access-token>
Content-Type: application/json
```

The bearer token assumption is a contract placeholder, not a claim that authentication exists today. Every recruiter request must authenticate the caller and authorize access to the requested resource. Unauthorized resource access must not be made visible by returning records outside the caller's scope.

Dates and times follow these rules:

- Use `YYYY-MM-DD` for intentional date-only values, including `deadline`, `postedDate`, and `appliedDate`.
- Use ISO 8601 timestamps with an explicit timezone offset for actual moments, including `scheduledAt`, `createdAt`, and `updatedAt`. Example: `2026-10-12T10:00:00+05:30`.
- The current frontend date/time inputs collect local values. The future service layer must map them to the canonical representation by applying the confirmed recruiter/company timezone or an explicitly selected offset.
- Display formatting and human-readable labels remain frontend responsibilities.

All public resource IDs are opaque strings. Database-specific numeric IDs, UUID implementation details, and internal foreign keys are not frontend requirements.

## 4. Canonical response models

The following are **PROPOSED API CONTRACT** response shapes. Server-managed fields are read-only unless explicitly listed in a request body.

### 4.1 Job

```json
{
  "id": "job_123",
  "title": "Frontend Developer",
  "company": "Tech Solutions Ltd.",
  "location": "Colombo",
  "jobType": "full_time",
  "workArrangement": "hybrid",
  "salaryMin": 120000,
  "salaryMax": 180000,
  "experienceLevel": "mid",
  "description": "We are looking for a frontend developer.",
  "requirements": ["Good knowledge of React.js"],
  "skills": ["React.js", "JavaScript", "HTML", "CSS"],
  "status": "active",
  "applicantsCount": 32,
  "postedDate": "2026-10-02",
  "deadline": "2026-10-31",
  "createdAt": "2026-10-02T09:00:00+05:30",
  "updatedAt": "2026-10-02T09:00:00+05:30"
}
```

`jobType` is the employment type. `workArrangement` is a separate concept and may be `on_site`, `hybrid`, or `remote`; values such as `Hybrid` must not be placed in `jobType`. The backend must document the accepted employment-type values.

`salaryMin` and `salaryMax` are numeric amounts or `null` when not supplied. The API does not accept or return a display-only salary string. The frontend formats currency and ranges.

`status`, `applicantsCount`, `postedDate`, `createdAt`, and `updatedAt` are server-managed. `applicantsCount` must be calculated by the server from authorized application data and cannot be supplied or overwritten by a client. `deadline` is date-only. The proposed close operation changes `status` to `closed` without deleting related applications or interviews.

Create and update requests may include `title`, `company`, `location`, `jobType`, `workArrangement`, `salaryMin`, `salaryMax`, `experienceLevel`, `description`, `requirements`, `skills`, and `deadline`. They must not include `id`, `status`, `applicantsCount`, `postedDate`, `createdAt`, or `updatedAt`.

### 4.2 Application

```json
{
  "id": "application_123",
  "jobId": "job_123",
  "candidateId": "candidate_123",
  "candidateName": "Kasun Perera",
  "candidateEmail": "kasun.perera@example.com",
  "jobTitle": "Frontend Developer",
  "company": "Tech Solutions Ltd.",
  "appliedDate": "2026-10-02",
  "status": "shortlisted",
  "experience": "3 years",
  "skills": ["React.js", "JavaScript", "CSS", "Git"],
  "resume": {
    "id": "resume_123",
    "fileName": "kasun-perera-resume.pdf",
    "downloadUrl": "/api/v1/recruiter/applications/application_123/resume"
  },
  "updatedAt": "2026-10-04T14:20:00+05:30"
}
```

`candidateName`, `candidateEmail`, `jobTitle`, and `company` may be response snapshots for list/detail usability; the authoritative relationship is `candidateId` and `jobId`. `status` is server-managed and changes only through the status actions and business rules in section 7.

The `resume` object is optional. A filename alone is not a production download mechanism. Any download URL must be protected by authorization and may be short-lived. Storage provider, retention, scanning, and access-audit decisions are backend requirements.

### 4.3 Interview

```json
{
  "id": "interview_123",
  "applicationId": "application_123",
  "round": 1,
  "interviewType": "video",
  "stage": "technical",
  "scheduledAt": "2026-10-12T10:00:00+05:30",
  "status": "scheduled",
  "meetingLink": "https://meet.example.com/frontend-kasun",
  "location": null,
  "notes": "Technical discussion with the frontend team.",
  "candidate": {
    "id": "candidate_123",
    "name": "Kasun Perera",
    "email": "kasun.perera@example.com"
  },
  "job": {
    "id": "job_123",
    "title": "Frontend Developer"
  },
  "createdAt": "2026-10-05T09:00:00+05:30",
  "updatedAt": "2026-10-05T09:00:00+05:30"
}
```

`interviewType` is the format, for example `video`, `phone`, or `in_person`. `stage` is the interview stage and is separate from format. `meetingLink` is required for `video` and should be `null` otherwise. `location` is required for `in_person` and should be `null` for other formats. `scheduledAt` is always an ISO 8601 timestamp with an explicit offset.

An application has many interviews. `round` distinguishes multiple rounds. The backend must derive candidate and job relationships from `applicationId`; it must ignore or reject unrelated client-supplied `candidateId` or `jobId` values. Interview creation must not silently return an existing interview merely because another round exists.

### 4.4 Recruiter profile

```json
{
  "id": "recruiter_123",
  "firstName": "Alex",
  "lastName": "Rivera",
  "email": "alex.rivera@jobrecruit.example",
  "phone": "+94 77 123 4567",
  "jobTitle": "Hiring Manager",
  "company": "JobRecruit",
  "location": "Colombo, Sri Lanka",
  "professionalSummary": "Recruitment professional."
}
```

The profile ID and email are returned by the server. The client does not identify the recruiter by request-body ID.

### 4.5 Recruiter settings

```json
{
  "emailNotifications": true,
  "interviewReminders": true,
  "applicationNotifications": true,
  "jobPostingNotifications": false,
  "compactView": false
}
```

All settings fields are booleans. `PATCH` accepts only known fields and rejects unknown fields or non-boolean values. No reset endpoint is part of this contract.

### 4.6 Dashboard

```json
{
  "data": {
    "kpis": {
      "totalJobs": 12,
      "activeJobs": 8,
      "totalApplications": 145,
      "upcomingInterviews": 9,
      "shortlistedCandidates": 24
    },
    "applicationPipeline": [
      { "status": "pending", "count": 65 },
      { "status": "screening", "count": 32 },
      { "status": "shortlisted", "count": 18 },
      { "status": "interview", "count": 9 },
      { "status": "offer", "count": 4 },
      { "status": "hired", "count": 2 },
      { "status": "rejected", "count": 15 }
    ],
    "recentApplications": [],
    "upcomingInterviews": [],
    "activeJobs": [],
    "recentActivity": []
  }
}
```

The server calculates all KPI values and pipeline counts from the same authorized jobs, applications, and interviews data used by the other endpoints. The static `recruiterDashboard.js` values are not authoritative. `recentApplications`, `upcomingInterviews`, and `activeJobs` must use the canonical models or explicitly documented summaries.

### DECISION REQUIRED

Before implementation, confirm whether dashboard KPIs are lifetime or date-windowed, the definition of “upcoming,” the “closing soon” deadline window if added, whether `shortlistedCandidates` counts applications or distinct candidates, and the aggregation rules for `recentActivity`. The seven canonical application statuses above are the proposed pipeline; no `applied` status should be added unless the team explicitly changes the enum.

## 5. Proposed endpoints

All endpoints in this section are **PROPOSED API CONTRACT** and do not currently exist.

| Method | Path | Purpose | Success |
|---|---|---|---|
| `GET` | `/api/v1/recruiter/dashboard` | Return authorized server-calculated KPIs and summaries | `200` |
| `GET` | `/api/v1/recruiter/jobs` | List/search jobs; query: `q`, `status`, `jobType`, `workArrangement`, `location`, `page`, `pageSize`, `sort` | `200` |
| `GET` | `/api/v1/recruiter/jobs/{jobId}` | Get one authorized job | `200` |
| `POST` | `/api/v1/recruiter/jobs` | Create a job | `201` |
| `PATCH` | `/api/v1/recruiter/jobs/{jobId}` | Update editable job fields | `200` |
| `POST` | `/api/v1/recruiter/jobs/{jobId}/close` | Close a job without deleting related records | `200` |
| `GET` | `/api/v1/recruiter/applications` | List/search/filter applications; query: `jobId`, `status`, `q`, `page`, `pageSize`, `sort` | `200` |
| `GET` | `/api/v1/recruiter/applications/{applicationId}` | Get an authorized application and its relationships | `200` |
| `POST` | `/api/v1/recruiter/applications/{applicationId}/shortlist` | Transition an application to `shortlisted` | `200` |
| `POST` | `/api/v1/recruiter/applications/{applicationId}/reject` | Transition an application to `rejected` | `200` |
| `GET` | `/api/v1/recruiter/interviews` | List/filter authorized interviews; query: `applicationId`, `jobId`, `status`, `interviewType`, `from`, `to`, `page`, `pageSize`, `sort` | `200` |
| `GET` | `/api/v1/recruiter/interviews/{interviewId}` | Get an authorized interview | `200` |
| `POST` | `/api/v1/recruiter/interviews` | Schedule a new interview for an application | `201` |
| `PATCH` | `/api/v1/recruiter/interviews/{interviewId}` | Update schedule/details while allowed | `200` |
| `POST` | `/api/v1/recruiter/interviews/{interviewId}/complete` | Transition an interview to `completed` | `200` |
| `POST` | `/api/v1/recruiter/interviews/{interviewId}/cancel` | Transition an interview to `cancelled` | `200` |
| `GET` | `/api/v1/recruiter/profile` | Get the authenticated recruiter's profile | `200` |
| `PATCH` | `/api/v1/recruiter/profile` | Update the authenticated recruiter's profile | `200` |
| `GET` | `/api/v1/recruiter/settings` | Get the authenticated recruiter's settings | `200` |
| `PATCH` | `/api/v1/recruiter/settings` | Update known boolean settings | `200` |

There is intentionally no permanent job-delete endpoint and no settings-reset endpoint. Closing preserves relationships. Settings reset behavior is unresolved and must be decided before a reset feature is added.

### 5.1 List response and pagination

List endpoints use the success envelope and a consistent pagination shape:

```json
{
  "data": [
    {
      "id": "job_123",
      "title": "Frontend Developer",
      "status": "active",
      "applicantsCount": 32
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

The backend must document default and maximum `pageSize`, supported sort fields, and query length limits.

## 6. Request and response examples

### 6.1 Create a job

`POST /api/v1/recruiter/jobs`

```json
{
  "title": "Frontend Developer",
  "company": "Tech Solutions Ltd.",
  "location": "Colombo",
  "jobType": "full_time",
  "workArrangement": "hybrid",
  "salaryMin": 120000,
  "salaryMax": 180000,
  "experienceLevel": "mid",
  "description": "We are looking for a talented frontend developer.",
  "requirements": ["Good knowledge of React.js", "HTML and CSS experience"],
  "skills": ["React.js", "JavaScript", "HTML", "CSS"],
  "deadline": "2026-10-31"
}
```

`201 Created`

```json
{
  "data": {
    "id": "job_123",
    "title": "Frontend Developer",
    "company": "Tech Solutions Ltd.",
    "location": "Colombo",
    "jobType": "full_time",
    "workArrangement": "hybrid",
    "salaryMin": 120000,
    "salaryMax": 180000,
    "experienceLevel": "mid",
    "description": "We are looking for a talented frontend developer.",
    "requirements": ["Good knowledge of React.js", "HTML and CSS experience"],
    "skills": ["React.js", "JavaScript", "HTML", "CSS"],
    "status": "active",
    "applicantsCount": 0,
    "postedDate": "2026-10-10",
    "deadline": "2026-10-31",
    "createdAt": "2026-10-10T09:00:00+05:30",
    "updatedAt": "2026-10-10T09:00:00+05:30"
  }
}
```

### 6.2 Schedule an interview

`POST /api/v1/recruiter/interviews`

```json
{
  "applicationId": "application_123",
  "round": 1,
  "interviewType": "video",
  "stage": "technical",
  "scheduledAt": "2026-10-12T10:00:00+05:30",
  "meetingLink": "https://meet.example.com/frontend-kasun",
  "notes": "Technical discussion with the frontend team."
}
```

`201 Created` returns the canonical interview model. The backend must verify that the application is authorized and currently `shortlisted`, derive the candidate and job from that application, create the interview, and update the application to `interview` as one transactional business operation. If either change cannot be committed, neither change is visible as successful and the response is an appropriate `409` or `422`.

### 6.3 Update profile and settings

`PATCH /api/v1/recruiter/profile`

```json
{
  "firstName": "Alex",
  "lastName": "Rivera",
  "phone": "+94 77 123 4567",
  "jobTitle": "Hiring Manager",
  "company": "JobRecruit",
  "location": "Colombo, Sri Lanka",
  "professionalSummary": "Recruitment professional."
}
```

`PATCH /api/v1/recruiter/settings`

```json
{
  "emailNotifications": false,
  "compactView": true
}
```

Unknown settings fields and non-boolean values are rejected. The recruiter identity is taken from authentication, not from either request body.

## 7. Status rules and transactional behavior

### 7.1 Application statuses

### VERIFIED IN CURRENT CODE

Recruiter mock applications use lowercase `pending`, `shortlisted`, and `rejected`. Candidate mocks use title-case display values, and dashboard mocks display `Applied`, `Screening`, `Shortlisted`, `Interview`, `Offer`, and `Hired`. The recruiter UI currently exposes shortlist and reject actions. These observations describe current mock behavior only.

### PROPOSED API CONTRACT

The only API values are:

`pending`, `screening`, `shortlisted`, `interview`, `offer`, `hired`, `rejected`

The frontend may render labels such as “Pending” or “Shortlisted,” but it must send and receive the lowercase values. The proposed allowed transitions are:

```text
pending -> screening
pending -> shortlisted
pending -> rejected
screening -> shortlisted
screening -> rejected
shortlisted -> interview
shortlisted -> rejected
interview -> offer
interview -> rejected
offer -> hired
offer -> rejected
```

Transitions not listed are invalid by default. The backend must reject them and must not allow clients to write `status` through ordinary job or application update payloads. `POST /api/v1/recruiter/applications/{applicationId}/shortlist` and `POST /api/v1/recruiter/applications/{applicationId}/reject` are explicit transition commands. Scheduling an interview is the command that transitions `shortlisted` to `interview`; it must make the interview creation and application transition transactionally consistent.

### 7.2 Interview statuses

The only API values are `scheduled`, `completed`, and `cancelled`.

```text
scheduled -> completed
scheduled -> cancelled
```

Completed and cancelled interviews are terminal unless a future reschedule command is added. Multiple interview rounds are supported; an application may have zero, one, or many interviews.

### 7.3 Job status

The proposed job statuses are `active` and `closed`. `POST /api/v1/recruiter/jobs/{jobId}/close` is the explicit close command. Whether a deadline automatically closes a job, whether a closed job can be edited, and whether reopening is needed are **DECISION REQUIRED**. No permanent deletion is proposed.

## 8. Validation and error format

### PROPOSED API CONTRACT

Successful responses use:

```json
{
  "data": {}
}
```

Errors use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "fields": [
      {
        "field": "deadline",
        "code": "INVALID_DATE",
        "message": "Use YYYY-MM-DD."
      }
    ],
    "requestId": "req_123"
  }
}
```

`error.fields` is included when field-level validation details exist. `error.requestId` is included when the server has assigned a request ID. The server must not return stack traces or success-shaped fallbacks for failures.

| Status | Meaning |
|---|---|
| `200 OK` | Successful reads, updates, and command actions |
| `201 Created` | Successful job or interview creation |
| `400 Bad Request` | Malformed JSON, invalid query syntax, or unsupported parameter |
| `401 Unauthorized` | Missing or invalid authentication |
| `403 Forbidden` | Authenticated caller lacks the required recruiter/resource permission |
| `404 Not Found` | Resource does not exist in the caller's visible scope |
| `409 Conflict` | Stale update, conflicting schedule, or invalid state conflict |
| `422 Unprocessable Entity` | Well-formed request failing field or transition validation |
| `500 Internal Server Error` | Unexpected server failure |

At minimum, the backend validates required job fields, numeric salary ranges, non-empty string arrays, date-only and timestamp formats, conditional interview fields, status transitions, profile email, and settings field names/types. Validation must not rely on React components.

## 9. Relationships and authorization

### VERIFIED IN CURRENT CODE

Recruiter applications reference jobs with `jobId`; recruiter interviews reference applications and also contain duplicated candidate/job fields. The current services do not store a recruiter ID in job, application, or interview mocks. The interview service currently prevents a second interview for one application.

### PROPOSED API CONTRACT

```text
Recruiter 1 ── * Job
Job       1 ── * Application
Candidate 1 ── * Application
Application 1 ── * Interview
Recruiter 1 ── 1 Profile
Recruiter 1 ── 1 Settings
```

Authorization is evaluated for every resource lookup and mutation. Interview creation derives the candidate and job solely from the authorized application. The backend must not trust unrelated candidate/job identifiers supplied by a client.

## 10. Existing service mapping and migration

### VERIFIED IN CURRENT CODE

Current services expose `getJobs`, `getJobById`, `createJob`, `updateJob`, `deleteJob`, `updateJobStatus`, application list/detail/status functions, interview list/detail/create/update/status functions, and profile/settings get/update functions. `resetRecruiterSettings` is local-only mock behavior. `getInterviewsByApplicationId` returns an array, but the mock creation logic currently suppresses duplicates.

### PROPOSED API CONTRACT

Preserve the service-layer migration approach: page components should continue to use service-level functions while service implementations change from in-memory data to HTTP calls. Future services will call only the proposed `/api/v1` endpoints; this contract does not implement those calls.

Mapping:

- `getJobs` → `GET /api/v1/recruiter/jobs`
- `getJobById` → `GET /api/v1/recruiter/jobs/{jobId}`
- `createJob` → `POST /api/v1/recruiter/jobs`
- `updateJob` → `PATCH /api/v1/recruiter/jobs/{jobId}`
- `updateJobStatus` for closing → `POST /api/v1/recruiter/jobs/{jobId}/close`
- `getApplications` → `GET /api/v1/recruiter/applications`
- `getApplicationById` → `GET /api/v1/recruiter/applications/{applicationId}`
- shortlist/reject actions → their explicit application command endpoints
- interview list/detail/create/update/status functions → the corresponding interview endpoints
- `getRecruiterProfile`/`updateRecruiterProfile` → profile `GET`/`PATCH`
- `getRecruiterSettings`/`updateRecruiterSettings` → settings `GET`/`PATCH`
- dashboard data → `GET /api/v1/recruiter/dashboard`

The migration must not claim that integration is complete. It must add loading, transport-error, unauthorized, and pagination states when HTTP services are introduced. The frontend must map local date/time controls to `scheduledAt`, display numeric salary values, render status labels, and treat resume URLs as protected resources.

## 11. Decisions the backend team must confirm

1. Authentication provider, bearer-token details, recruiter roles, and organization/team authorization.
2. Whether `company` is free text or a linked resource, and whether recruiters may manage shared company jobs.
3. Allowed `jobType`, `workArrangement`, `experienceLevel`, and interview `stage` values.
4. Dashboard aggregation windows, “upcoming” definition, closing-soon window, and distinct-candidate counting.
5. Automatic deadline closure and whether closed jobs may be edited or reopened.
6. Profile field length limits and whether an email address may be changed.
7. Settings reset behavior; no reset endpoint is included until explicitly justified.
8. Resume storage provider, malware scanning, retention, protected download mechanism, and audit policy.
9. Timezone source when converting frontend local date/time inputs.
10. Whether candidate-facing application creation and candidate authentication are in scope for a separate contract.

## 12. Candidate API Requirements

### VERIFIED IN CURRENT CODE

The Candidate frontend currently provides registration and login forms, public job search and details, application submission intent, application list/detail screens, an interview list, profile editing, candidate settings, and a resume replacement control. These screens currently use mock data or local state; none of the endpoints below currently exists.

### PROPOSED API CONTRACT

Candidate endpoints use the fixed `/api/v1` base path and the same opaque string IDs, success envelopes, error format, date rules, and lowercase API statuses defined earlier in this document. The numeric IDs in the current mock data are not API requirements. Candidate list endpoints use the pagination shape in section 5.1. A candidate is identified from the authenticated token; request bodies must not accept a client-supplied `candidateId` for ordinary candidate operations.

Candidate authentication is required for profile, settings, resume, application, and interview endpoints. Public job browsing and job details do not require authentication. A candidate may read or mutate only their own profile, settings, resume, applications, and interviews. The backend must return `401` for missing/invalid authentication, `403` for an authenticated caller without the required permission, and `404` when a requested protected resource is not in the caller's visible scope. These are proposed requirements, not claims that the frontend is already integrated.

### 12.1 Candidate registration and login

| Method | Path | Purpose | Authentication | Success |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Create a candidate account from the fields currently collected by the registration form | None | `201` |
| `POST` | `/api/v1/auth/login` | Authenticate a candidate and return a session/token plus the authenticated candidate summary | None | `200` |

`POST /api/v1/auth/register`

Request:

```json
{
  "firstName": "Alex",
  "lastName": "Perera",
  "email": "alex.perera@example.com",
  "password": "candidate-password",
  "role": "candidate"
}
```

The frontend offers `recruiter` as another account type, but this section defines only candidate registration. Whether this shared form may create recruiter accounts, and whether `role` should be omitted and derived from a candidate-only route, are **DECISION REQUIRED**. The backend must not allow a caller to escalate a candidate account by changing `role`.

`201 Created`:

```json
{
  "data": {
    "candidate": {
      "id": "candidate_123",
      "firstName": "Alex",
      "lastName": "Perera",
      "email": "alex.perera@example.com"
    },
    "accessToken": "token_issued_by_authentication_service"
  }
}
```

`POST /api/v1/auth/login`

Request:

```json
{
  "email": "alex.perera@example.com",
  "password": "candidate-password",
  "role": "candidate"
}
```

`200 OK`:

```json
{
  "data": {
    "candidate": {
      "id": "candidate_123",
      "firstName": "Alex",
      "lastName": "Perera",
      "email": "alex.perera@example.com"
    },
    "accessToken": "token_issued_by_authentication_service"
  }
}
```

The token format, refresh-token policy, expiry, storage, and whether the selected `role` is checked or ignored are **DECISION REQUIRED**. Passwords must never be returned or logged. Duplicate email, invalid credentials, and invalid role values use the canonical error envelope.

### 12.2 Candidate profile retrieval and update

| Method | Path | Purpose | Authentication and authorization | Success |
|---|---|---|---|---|
| `GET` | `/api/v1/candidate/profile` | Return the authenticated candidate's editable profile and current resume summary | Bearer token; candidate may read only their own profile | `200` |
| `PATCH` | `/api/v1/candidate/profile` | Update the profile fields rendered by the Profile screen | Bearer token; candidate may update only their own profile | `200` |

`GET /api/v1/candidate/profile` and `200 OK`:

```json
{
  "data": {
    "id": "candidate_123",
    "firstName": "Alex",
    "lastName": "Perera",
    "email": "alex.perera@example.com",
    "phone": "+94 77 123 4567",
    "location": "Colombo, Sri Lanka",
    "summary": "Product-minded frontend developer.",
    "skills": "React, JavaScript, HTML, CSS, Git, Figma",
    "education": "BSc in Information Technology — University of Colombo, 2022",
    "experience": "Frontend Developer at TechNova — 2022 to Present",
    "resume": {
      "id": "resume_123",
      "fileName": "Alex_Perera_Resume.pdf",
      "updatedAt": "2025-05-12T09:00:00+05:30",
      "sizeBytes": 1258291,
      "downloadUrl": "/api/v1/candidate/resume/download"
    }
  }
}
```

`PATCH /api/v1/candidate/profile`

Request:

```json
{
  "firstName": "Alex",
  "lastName": "Perera",
  "email": "alex.perera@example.com",
  "phone": "+94 77 123 4567",
  "location": "Colombo, Sri Lanka",
  "summary": "Product-minded frontend developer.",
  "skills": "React, JavaScript, HTML, CSS, Git, Figma",
  "education": "BSc in Information Technology — University of Colombo, 2022",
  "experience": "Frontend Developer at TechNova — 2022 to Present"
}
```

`200 OK` returns the updated profile in the same `data` shape as the retrieval response. `id`, `resume`, and timestamps are server-managed. Whether email changes are permitted through this endpoint or only through the account-email endpoint in section 12.5 is **DECISION REQUIRED**. The backend must validate email format and field lengths and must not expose another candidate's profile through an ID in the request.

### 12.3 Public job browsing, searching, and job details

| Method | Path | Purpose | Authentication and authorization | Success |
|---|---|---|---|---|
| `GET` | `/api/v1/jobs` | List public active jobs, with the filters used by Browse Jobs and the dashboard search | No authentication; return only publicly discoverable jobs | `200` |
| `GET` | `/api/v1/jobs/{jobId}` | Return the public details needed by the Job Details screen | No authentication; a non-public job is not visible | `200` |

`GET /api/v1/jobs?q=frontend&location=Colombo&jobType=full_time&page=1&pageSize=20`

`200 OK`:

```json
{
  "data": [
    {
      "id": "job_123",
      "title": "Frontend Developer",
      "company": "Tech Solutions Ltd.",
      "location": "Colombo",
      "jobType": "full_time",
      "workArrangement": "hybrid",
      "salaryMin": 120000,
      "salaryMax": 180000,
      "description": "Build high-quality web applications.",
      "requirements": ["Good knowledge of React.js"],
      "skills": ["React.js", "JavaScript", "HTML", "CSS"],
      "status": "active",
      "postedDate": "2026-10-02",
      "deadline": "2026-10-31"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

Search should cover the job title and company, and may include location, description, requirements, and skills because those are the fields searched by the existing Candidate data helper. The exact matching, case-folding, default sort, maximum page size, and whether `deadline` or `status` controls public visibility are **DECISION REQUIRED**. The Candidate UI displays a salary string and title-case job-type labels, but the API must continue to use numeric salary fields and the canonical `jobType`/`workArrangement` fields defined in section 4.1.

`GET /api/v1/jobs/job_123` returns `200 OK` with one `data` object using the same job fields as the list response. No candidate authorization is needed. The backend must not return closed or otherwise private jobs unless the team explicitly approves that visibility rule.

### 12.4 Job application submission

| Method | Path | Purpose | Authentication and authorization | Success |
|---|---|---|---|---|
| `POST` | `/api/v1/candidate/applications` | Submit the authenticated candidate's application for a public job | Bearer token; candidate may create an application only for themself and an eligible job | `201` |

`POST /api/v1/candidate/applications`

Request:

```json
{
  "jobId": "job_123"
}
```

The current Job Details screen has an Apply button but no additional cover-letter or application-question fields. Therefore no such fields are proposed. Whether an application must reference the candidate's current `resumeId`, and whether a cover letter is required later, are **DECISION REQUIRED**. If a resume is required, the backend should reject submission with a validation error rather than silently applying without it.

`201 Created`:

```json
{
  "data": {
    "id": "application_123",
    "jobId": "job_123",
    "candidateId": "candidate_123",
    "jobTitle": "Frontend Developer",
    "company": "Tech Solutions Ltd.",
    "location": "Colombo",
    "jobType": "full_time",
    "appliedDate": "2026-10-11",
    "status": "pending",
    "updatedAt": "2026-10-11T11:46:26+05:30"
  }
}
```

`appliedDate` is date-only and `updatedAt` is an ISO 8601 timestamp with an explicit offset. The server assigns `candidateId`, status, dates, and all relationship snapshots. Duplicate applications, closed/deadline-passed jobs, and whether a candidate may reapply after rejection are **DECISION REQUIRED**; conflicts must use `409`, not a success-shaped response.

### 12.5 Candidate application listing and details

| Method | Path | Purpose | Authentication and authorization | Success |
|---|---|---|---|---|
| `GET` | `/api/v1/candidate/applications` | List the authenticated candidate's applications, filtered by search text and status | Bearer token; return only the caller's applications | `200` |
| `GET` | `/api/v1/candidate/applications/{applicationId}` | Return one application for the authenticated candidate | Bearer token; application must belong to the caller | `200` |

`GET /api/v1/candidate/applications?q=frontend&status=shortlisted&page=1&pageSize=20`

`200 OK`:

```json
{
  "data": [
    {
      "id": "application_123",
      "jobId": "job_123",
      "candidateId": "candidate_123",
      "jobTitle": "Frontend Developer",
      "company": "Tech Solutions Ltd.",
      "location": "Colombo",
      "jobType": "full_time",
      "appliedDate": "2026-10-02",
      "status": "shortlisted",
      "updatedAt": "2026-10-04T14:20:00+05:30"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

The `q` filter covers the job title and company displayed by the Candidate application list. The API returns canonical lowercase statuses; the frontend maps them to labels such as “Pending”, “Shortlisted”, “Interview”, and “Rejected”. Candidate application status is server-managed and cannot be changed by these endpoints.

`GET /api/v1/candidate/applications/application_123` returns `200 OK` with one `data` object using the same fields as the list item. The frontend's `lastUpdated` display maps to canonical `updatedAt`; no separate `lastUpdated` field is required. The backend must enforce ownership even when an application ID is guessed.

### 12.6 Candidate interview listing

| Method | Path | Purpose | Authentication and authorization | Success |
|---|---|---|---|---|
| `GET` | `/api/v1/candidate/interviews` | List the authenticated candidate's upcoming, completed, and cancelled interviews | Bearer token; return only interviews belonging to the caller's applications | `200` |

`GET /api/v1/candidate/interviews?status=scheduled&page=1&pageSize=20`

`200 OK`:

```json
{
  "data": [
    {
      "id": "interview_123",
      "applicationId": "application_123",
      "round": 1,
      "interviewType": "technical",
      "stage": "technical",
      "scheduledAt": "2026-10-12T10:00:00+05:30",
      "status": "scheduled",
      "meetingLink": "https://meet.example.com/frontend-kasun",
      "location": null,
      "interviewer": "Sarah Johnson",
      "notes": "Prepare for the technical discussion.",
      "job": {
        "id": "job_123",
        "title": "Frontend Developer",
        "company": "Tech Solutions Ltd."
      },
      "createdAt": "2026-10-05T09:00:00+05:30",
      "updatedAt": "2026-10-05T09:00:00+05:30"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

The frontend displays date and time separately, but the API uses canonical `scheduledAt`. It displays “Upcoming”, “Completed”, and “Cancelled”; the API values are `scheduled`, `completed`, and `cancelled` as defined in section 7.2. `interviewer` is included because the existing Candidate screen displays it. Candidate interview data is read-only from this surface; scheduling, changing, completing, or cancelling remains governed by recruiter authorization and the existing recruiter endpoints. Whether candidates may see interviewer names, meeting links, notes, or cancelled interviews is **DECISION REQUIRED**.

### 12.7 Candidate settings and account actions

| Method | Path | Purpose | Authentication and authorization | Success |
|---|---|---|---|---|
| `GET` | `/api/v1/candidate/settings` | Return notification and profile-visibility preferences shown by Candidate Settings | Bearer token; candidate may read only their own settings | `200` |
| `PATCH` | `/api/v1/candidate/settings` | Update notification toggles and profile visibility | Bearer token; candidate may update only their own settings | `200` |
| `PATCH` | `/api/v1/candidate/account/email` | Change the account email from the Change email modal | Bearer token; candidate may change only their own email | `200` |
| `POST` | `/api/v1/candidate/account/password` | Change the account password from the Change password modal | Bearer token; candidate may change only their own password | `200` |

`GET /api/v1/candidate/settings` and `200 OK`:

```json
{
  "data": {
    "notifications": {
      "recommendations": true,
      "applications": true,
      "interviews": true
    },
    "profileVisibility": "public"
  }
}
```

`PATCH /api/v1/candidate/settings`

Request:

```json
{
  "notifications": {
    "recommendations": false,
    "applications": true,
    "interviews": true
  },
  "profileVisibility": "recruiters_only"
}
```

`200 OK` returns the complete updated settings object in the same shape. Accepted visibility values are `public`, `recruiters_only`, and `private`, corresponding to the labels currently rendered by the UI. Whether profile visibility affects public profile search or only recruiter views is **DECISION REQUIRED**. Unknown fields, partial nested objects, and non-boolean notification values must use the canonical validation error.

`PATCH /api/v1/candidate/account/email`

Request:

```json
{
  "currentPassword": "candidate-password",
  "newEmail": "alex.new@example.com"
}
```

`200 OK`:

```json
{
  "data": {
    "email": "alex.new@example.com"
  }
}
```

`POST /api/v1/candidate/account/password`

Request:

```json
{
  "currentPassword": "candidate-password",
  "newPassword": "new-candidate-password"
}
```

`200 OK`:

```json
{
  "data": {
    "updated": true
  }
}
```

The backend must not return passwords. Password policy, email verification, reauthentication, token invalidation after password/email change, and whether the frontend's logout action needs a server-side revocation endpoint are **DECISION REQUIRED**. The current Delete account button explicitly identifies itself as a frontend-only preview, so no delete endpoint is proposed.

### 12.8 Resume upload and protected download

| Method | Path | Purpose | Authentication and authorization | Success |
|---|---|---|---|---|
| `POST` | `/api/v1/candidate/resume` | Upload or replace the authenticated candidate's resume from the Profile screen | Bearer token; candidate may write only their own resume | `201` |
| `GET` | `/api/v1/candidate/resume/download` | Download the authenticated candidate's current resume | Bearer token; candidate may download only their own resume | File response or `302` |

The Profile screen includes a Replace control and displays filename, updated date, and size; therefore upload is required for the intended profile behavior. The resume download link is also proposed because resumes are shared with employers and the canonical application model contains a resume download URL. The current frontend does not expose a standalone download button, so whether candidate self-download is needed in the first release is **DECISION REQUIRED**.

`POST /api/v1/candidate/resume` uses `multipart/form-data`, not JSON:

```text
Content-Disposition: form-data; name="file"; filename="Alex_Perera_Resume.pdf"
Content-Type: application/pdf

<binary file contents>
```

`201 Created`:

```json
{
  "data": {
    "id": "resume_123",
    "fileName": "Alex_Perera_Resume.pdf",
    "updatedAt": "2026-10-11T11:46:26+05:30",
    "sizeBytes": 1258291,
    "downloadUrl": "/api/v1/candidate/resume/download"
  }
}
```

`GET /api/v1/candidate/resume/download` must authenticate and authorize the candidate before returning the file. It may return the file directly with an appropriate `Content-Type` and `Content-Disposition`, or a short-lived protected redirect. The URL must not be a permanent public object-storage URL. Allowed file types, maximum size, malware scanning, replacement/version retention, storage provider, audit logging, and whether recruiters receive a separate short-lived application download URL are **DECISION REQUIRED**. Upload validation failures use the canonical `400`/`422` error envelope; a missing resume returns `404`.

### 12.9 Candidate unresolved decisions

1. Authentication provider, token/refresh-token format, expiry, storage, and role handling for the shared login/register form.
2. Whether recruiter account creation remains available through the shared registration form or candidate registration becomes candidate-only.
3. Whether candidate email changes are allowed through profile update, account settings only, or require verification.
4. Whether an application requires the candidate's current resume, and whether cover letters or application questions will be added.
5. Duplicate application and reapplication rules, including behavior for closed or deadline-passed jobs.
6. Public job visibility rules, exact search matching, default sorting, and pagination limits.
7. Candidate visibility semantics for `public`, `recruiters_only`, and `private`.
8. Whether candidates may see interviewer names, meeting links, interview notes, and cancelled interviews.
9. Password policy, reauthentication, email verification, and token invalidation after credential changes.
10. Resume file types, size limits, malware scanning, retention, storage, audit policy, protected download mechanism, and candidate self-download.
11. Whether logout requires server-side token revocation; the current UI can end a client session without a separate endpoint.

## 13. Admin API requirements

### VERIFIED IN CURRENT CODE

The Admin frontend has Dashboard, User Management, Job Management, Application Management, Activity Logs, and Settings pages. These pages currently use sample arrays and in-memory data; Admin has no API client or integration. Current Admin views are read-only for users, jobs, and applications. Dashboard date selection and activity navigation are disabled. Settings values and the Admin-only theme are preview/session state.

### PROPOSED API CONTRACT

Every endpoint in this section is **PROPOSED** and does not currently exist. The first Admin integration should be read-only. These endpoints reuse the `/api/v1` prefix, `{ "data": ... }` success envelope, list pagination envelope from section 5.1, structured errors from section 8, opaque string IDs, and date/time formats from section 3. They reuse the canonical Job and Application models from section 4 and the canonical Candidate/Recruiter identity concepts; they do not define replacement Candidate or Recruiter models.

Every request requires an authenticated Admin principal. The proposed transport is `Authorization: Bearer <access-token>` as described in section 3, pending confirmation of the authentication provider and token mechanism. The backend must enforce Admin authorization on every request and resource lookup; hiding routes in the frontend is not authorization. A client-supplied role is never trusted. Until role names and authentication are agreed, endpoint access must be treated as undecided and unavailable for production.

List endpoints use `page` and `pageSize` and return the section 5.1 envelope. The backend must document default/maximum page sizes, sort keys, filter enums, search fields, and query limits. Unless otherwise specified, expected failures use the section 8 error envelope: `400` invalid/unsupported query, `401` missing or invalid authentication, `403` insufficient Admin permission, `404` missing or out-of-scope resource, and `500` unexpected server failure. No endpoint below permits mutation.

#### 13.1 Dashboard summary

**`GET /api/v1/admin/dashboard` — Essential, proposed.** Returns server-calculated totals and a recent-activity preview for the Admin dashboard. Proposed query parameters: optional `from` and `to` as `YYYY-MM-DD` only if a date-windowed dashboard is approved; otherwise the endpoint returns a documented default reporting window. Invalid or unsupported range parameters return `400`; authentication/authorization and server errors follow the common cases above.

Example `200 OK`:

```json
{
  "data": {
    "kpis": {
      "totalUsers": 2486,
      "totalCandidates": 1842,
      "totalRecruiters": 644,
      "totalJobs": 328,
      "totalApplications": 5672
    },
    "recentActivity": [
      {
        "id": "activity_123",
        "action": "user.created",
        "summary": "A candidate account was created",
        "occurredAt": "2026-10-12T10:00:00+05:30"
      }
    ]
  }
}
```

The recent-activity array is a bounded summary, not a paginated list; its maximum size, event fields, time window, and whether actor details are included require agreement. Counts must be calculated server-side from the same authorized data as list endpoints. If date-windowing is accepted, define whether user totals are current totals or registrations within the window.

#### 13.2 Users

**`GET /api/v1/admin/users` — Essential, proposed.** Lists Candidate and Recruiter accounts for review. Proposed query parameters: `q` (documented name/email matching), `role`, `status`, `page`, `pageSize`, and optional documented `sort`. Filtering and pagination occur on the server before returning the page; invalid role/status/sort/query values return `400`.

Example `200 OK`:

```json
{
  "data": [
    {
      "id": "user_123",
      "name": "Alex Morgan",
      "email": "alex@example.com",
      "role": "candidate",
      "status": "active",
      "createdAt": "2026-10-02T09:00:00+05:30"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 1, "totalPages": 1 }
}
```

**`GET /api/v1/admin/users/{userId}` — Essential, proposed.** Returns the Admin-visible identity fields for one Candidate or Recruiter. No query or body. Example `200 OK`: `{ "data": { "id": "user_123", "name": "Alex Morgan", "email": "alex@example.com", "role": "candidate", "status": "active", "createdAt": "2026-10-02T09:00:00+05:30" } }`. A missing or non-visible ID returns `404`; do not include credential material or private profile data not needed for Admin review.

The exact `role` and `status` enums, whether Admin accounts appear in this list, and whether registration time is exposed as `createdAt` or another canonical timestamp require backend agreement. These examples are illustrative, not new agreed models.

#### 13.3 Jobs

**`GET /api/v1/admin/jobs` — Essential, proposed.** Read-only listing reusing the canonical Job model in section 4.1. Proposed query parameters: `q`, `status`, `jobType`, `page`, `pageSize`, and optional documented `sort`. Search fields and accepted enum values must be documented; filters and pagination are server-side. Invalid query values return `400`.

Example `200 OK`:

```json
{
  "data": [
    {
      "id": "job_123",
      "title": "Frontend Developer",
      "company": "Tech Solutions Ltd.",
      "location": "Colombo",
      "jobType": "full_time",
      "workArrangement": "hybrid",
      "status": "active",
      "applicantsCount": 32,
      "postedDate": "2026-10-02",
      "deadline": "2026-10-31"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 1, "totalPages": 1 }
}
```

**`GET /api/v1/admin/jobs/{jobId}` — Essential, proposed.** Returns one authorized Admin-visible canonical Job resource, including its canonical detail fields (`description`, `requirements`, and `skills`). No query or body. Example `200 OK`: `{ "data": { "id": "job_123", "title": "Frontend Developer", "company": "Tech Solutions Ltd.", "location": "Colombo", "jobType": "full_time", "workArrangement": "hybrid", "status": "active", "applicantsCount": 32, "postedDate": "2026-10-02", "deadline": "2026-10-31", "description": "Frontend role.", "requirements": ["React experience"], "skills": ["React"] } }`. Missing/out-of-scope IDs return `404`.

Both routes are read-only; current Admin UI does not authorize create, update, close, reopen, or delete operations. `jobType`, `workArrangement`, and status values remain exactly as defined by the canonical Job contract; mock display values must be mapped rather than adopted as API enums.

#### 13.4 Applications

**`GET /api/v1/admin/applications` — Essential, proposed.** Read-only listing reusing the canonical Application model in section 4.2. Proposed query parameters: `q`, `status`, `jobId`, `page`, `pageSize`, and optional documented `sort`. Define `q` search fields; status and job filters plus pagination are server-side. Invalid query/filter values return `400`.

Example `200 OK`:

```json
{
  "data": [
    {
      "id": "application_123",
      "jobId": "job_123",
      "candidateId": "candidate_123",
      "candidateName": "Alex Morgan",
      "candidateEmail": "alex@example.com",
      "jobTitle": "Frontend Developer",
      "company": "Tech Solutions Ltd.",
      "appliedDate": "2026-10-02",
      "status": "shortlisted",
      "experience": "3 years",
      "skills": ["React", "JavaScript"],
      "resume": null,
      "updatedAt": "2026-10-04T14:20:00+05:30"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 1, "totalPages": 1 }
}
```

**`GET /api/v1/admin/applications/{applicationId}` — Essential, proposed.** Returns one authorized Admin-visible canonical Application and documented relationship snapshots. No query or body. Example `200 OK` uses the same Application fields as above in a single `{ "data": {...} }` object. Missing/out-of-scope IDs return `404`.

These routes do not grant resume download. The canonical `resume` field may be omitted or returned without a usable download URL for Admin unless the backend/product owner explicitly authorizes that access and defines protected delivery and audit requirements. Application status remains the canonical lowercase enum from section 7; no Admin status mutation is proposed.

#### 13.5 Activity logs

**`GET /api/v1/admin/activity-logs` — Essential for the existing Activity Logs page, proposed.** Lists authorized audit/activity events. Proposed query parameters: `q`, `category`, `from`, `to`, `page`, `pageSize`, and optional documented `sort`. `from`/`to` are date-only bounds with a documented timezone and inclusive/exclusive semantics. Filtering and pagination are server-side. Invalid ranges, categories, or sort values return `400`.

Example `200 OK`:

```json
{
  "data": [
    {
      "id": "activity_123",
      "action": "application.shortlisted",
      "category": "application",
      "actor": "Recruiter",
      "targetId": "application_123",
      "summary": "Application shortlisted",
      "occurredAt": "2026-10-12T10:00:00+05:30"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 1, "totalPages": 1 }
}
```

Event vocabulary, actor representation, target visibility, redaction, retention, audit coverage, default sort, and date-range timezone require agreement. Activity logs are read-only through this endpoint.

#### 13.6 Optional persisted platform settings

Persisted Admin platform settings are **OPTIONAL and DECISION REQUIRED**; current Settings Apply/Reset values are preview-only, and the Admin theme is local session state. If the group decides that platform-wide name/description must persist, proposed endpoints are `GET /api/v1/admin/settings` and `PATCH /api/v1/admin/settings`, both Admin-authorized, with `{ "data": { "platformName": "JobRecruit", "platformDescription": "Recruitment platform" } }` on read and a body containing only approved editable fields on update. The update response should return the complete updated `{ "data": {...} }` object with `updatedAt`. Validation uses the common `400`/`422` errors; authentication and authorization use `401`/`403`; unexpected failures use `500`. This optional proposal is not permission to persist Admin account profile or appearance fields, and no reset endpoint is proposed.

### DECISION REQUIRED

Before implementation, the backend developer/product owner must agree on:

1. Authentication provider, token lifecycle, Admin role name, Admin provisioning, login/session behavior, and whether existing Candidate/Recruiter authentication serves Admin.
2. User-list role scope and canonical user roles/statuses, including whether Admin accounts appear. Reconcile mock title-case `Candidate`/`Recruiter`, `Active`/`Inactive`, numeric IDs, and date-only `registered` with canonical lowercase roles/statuses, opaque IDs, and timestamp rules.
3. Whether Admin endpoints return the exact canonical Job/Application models or a documented safe projection. Reconcile mock job types (`Full-time`, `Hybrid`, `Remote`) with canonical `jobType` versus `workArrangement`; confirm Job status values and application status enum compatibility.
4. Dashboard count definitions, reporting window, timezone, recent-activity schema/count, and whether a date-range query is needed.
5. Activity event schema, categories, actor/target disclosure, retention, redaction, sort, and filtering semantics.
6. Whether any Admin mutations are needed later. The initial contract is read-only; it deliberately adds no user suspend/reactivate, job state, or application state mutation.
7. Whether Admin may view or download resumes. No download access is implied by the proposal.
8. Whether platform settings require persistence. If yes, define editable fields, audit rules, and whether those settings are global or tenant-scoped.
9. Defaults and maximums for pagination, search semantics/limits, sort fields, date-range boundaries, and common error details for Admin routes.

## 14. Backend implementation checklist

### PROPOSED API CONTRACT

- [ ] Confirm authentication, recruiter authorization, tenancy, and `/api/v1` deployment.
- [ ] Implement opaque string IDs for every public resource.
- [ ] Implement the canonical job, application, interview, profile, settings, and dashboard models.
- [ ] Keep `jobType` and `workArrangement` separate; keep numeric salary fields separate from display formatting.
- [ ] Calculate `applicantsCount` and all dashboard aggregates on the server.
- [ ] Enforce server-managed fields and reject client overwrite attempts.
- [ ] Enforce the canonical lowercase application statuses and listed transitions.
- [ ] Make interview scheduling plus the `shortlisted` → `interview` application transition transactional.
- [ ] Support one application to many interviews and derive interview relationships from the application.
- [ ] Validate conditional `meetingLink` and `location` fields.
- [ ] Implement list filtering, pagination, sorting, and documented limits.
- [ ] Implement recruiter-scoped authorization on every endpoint.
- [ ] Agree on and implement Admin authentication/authorization before exposing proposed Admin endpoints; keep initial Admin access read-only unless privileged mutations are explicitly agreed.
- [ ] Confirm Admin role/status models, activity event policy, and whether platform settings persist before implementing those optional or unresolved requirements.
- [ ] Implement protected resume access if resumes are in production scope.
- [ ] Return the documented success/error envelopes and HTTP statuses.
- [ ] Add contract and integration tests for authorization, validation, transitions, transactions, and multiple interview rounds.
- [ ] Keep an OpenAPI document synchronized with this contract.
- [ ] Update frontend services only after backend schemas and error codes are confirmed.

## 15. Inspection and validation statement

This document records proposed Candidate, Recruiter, and Admin API requirements. It preserves the verified finding that current recruiter and Admin services use in-memory mock data and that no API endpoint, authentication integration, or backend implementation exists. Proposed sections are intentionally labeled separately and do not describe future endpoints as existing.

The document was reviewed for consistency between endpoint paths, request/response examples, canonical model names, ID and date conventions, application/interview transitions, Admin read-only scope, and service migration mapping. JSON examples were reviewed for valid syntax and consistent envelopes.

**Exact file changed:** `docs/API_CONTRACT.md`
**Application code changed:** No
**Backend code changed:** No
**Other files changed:** No
