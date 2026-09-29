import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";

import Dashboard from "./pages/candidate/dashboard";
import FindJobs from "./pages/candidate/findjobs";
import JobDetails from "./pages/candidate/jobDetails";
import Applications from "./pages/candidate/applications";
import InterviewsPage from "./pages/candidate/interviewsPage";
import ResourcesPage from "./pages/candidate/resources";
import ResumeBuilder from "./pages/candidate/resumeBuilder";
import InterviewTips from "./pages/candidate/interviewTips";

function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* Login */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* Register */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* Candidate Dashboard */}
        <Route
          path="/candidate/dashboard"
          element={<Dashboard />}
        />

        {/* Find Jobs */}
        <Route
          path="/candidate/jobs"
          element={<FindJobs />}
        />

        {/* Job Details */}
        <Route
          path="/candidate/jobs/:jobId"
          element={<JobDetails />}
        />

        {/* Candidate Application pages */}
        <Route
          path="/candidate/applications"
          element={<Applications />}
        />

        <Route
          path="/candidate/interviews"
          element={<InterviewsPage />}
        />

        <Route
          path="/candidate/resources"
          element={<ResourcesPage />}
        />

        <Route
          path="/candidate/resources/resume-builder"
          element={<ResumeBuilder />}
        />

        <Route
          path="/candidate/resources/interview-tips"
          element={<InterviewTips />}
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;