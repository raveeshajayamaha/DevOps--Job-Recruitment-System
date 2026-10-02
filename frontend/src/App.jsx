import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
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

        {/* Home Page */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Login */}
        <Route
          path="/login"
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

        {/* Candidate Applications */}
        <Route
          path="/candidate/applications"
          element={<Applications />}
        />

        {/* Candidate Interviews */}
        <Route
          path="/candidate/interviews"
          element={<InterviewsPage />}
        />

        {/* Career Resources */}
        <Route
          path="/candidate/resources"
          element={<ResourcesPage />}
        />

        {/* Resume Builder */}
        <Route
          path="/candidate/resources/resume-builder"
          element={<ResumeBuilder />}
        />

        {/* Interview Tips */}
        <Route
          path="/candidate/resources/interview-tips"
          element={<InterviewTips />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;