# API Contract: DevOps-Enabled Job Recruitment & Applicant Tracking System

**Status:** Proposed contract for future backend implementation
**Repository source of truth inspected:** `frontend/src` and `frontend/package.json`
**Scope:** Recruiter dashboard, jobs, applications, interviews, recruiter profile, and recruiter settings

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

## 12. Backend implementation checklist

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
- [ ] Implement protected resume access if resumes are in production scope.
- [ ] Return the documented success/error envelopes and HTTP statuses.
- [ ] Add contract and integration tests for authorization, validation, transitions, transactions, and multiple interview rounds.
- [ ] Keep an OpenAPI document synchronized with this contract.
- [ ] Update frontend services only after backend schemas and error codes are confirmed.

## 13. Inspection and validation statement

This contract preserves the verified finding that current recruiter services use in-memory mock data and that no API endpoint, authentication integration, or backend implementation exists. The proposed sections are intentionally labeled separately and do not describe future endpoints as existing.

The document was reviewed for consistency between endpoint paths, request/response examples, canonical model names, ID and date conventions, application/interview transitions, transactional interview scheduling, and service migration mapping. JSON examples were reviewed for valid syntax and consistent envelopes.

**Exact file changed:** `docs/API_CONTRACT.md`
**Application code changed:** No
**Backend code changed:** No
**Other files changed:** No
