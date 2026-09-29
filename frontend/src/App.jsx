import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";

import Dashboard from "./pages/candidate/dashboard";
import FindJobs from "./pages/candidate/findjobs";
import JobDetails from "./pages/candidate/jobDetails";


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

      </Routes>

    </BrowserRouter>
  );
}


export default App;