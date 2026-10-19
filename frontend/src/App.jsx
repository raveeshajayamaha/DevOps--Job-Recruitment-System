import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";

import Dashboard from "./pages/candidate/dashboard";
import FindJobs from "./pages/candidate/findjobs";
import JobDetails from "./pages/candidate/jobDetails";
import Applications from "./pages/candidate/applications";
import CandidateApplicationDetails from "./pages/candidate/applicationDetails";
import InterviewsPage from "./pages/candidate/interviewsPage";
import ResourcesPage from "./pages/candidate/resources";
import ResumeBuilder from "./pages/candidate/resumeBuilder";
import InterviewTips from "./pages/candidate/interviewTips";
import Profile from "./pages/candidate/profile";
import Settings from "./pages/candidate/settings";
import RecruiterDashboard from "./pages/recruiter/dashboard";
import RecruiterJobDetails from "./pages/recruiter/jobDetails";
import EditJob from "./pages/recruiter/editJob";
import RecruiterApplications from "./pages/recruiter/applications";
import RecruiterApplicationDetails from "./pages/recruiter/applicationDetails";
import RecruiterInterviews from "./pages/recruiter/interviews";
import RecruiterInterviewDetails from "./pages/recruiter/interviewDetails";
import ScheduleInterview from "./pages/recruiter/scheduleInterview";
import ManageJobs from "./pages/recruiter/manageJobs";
import PostJob from "./pages/recruiter/postJob";
import RecruiterProfile from "./pages/recruiter/profile";
import RecruiterSettings from "./pages/recruiter/settings";
import AdminDashboard from "./pages/admin/dashboard";
import AdminLogin from "./pages/admin/login";
import AdminUsers from "./pages/admin/users";
import AdminJobs from "./pages/admin/jobs";
import AdminApplications from "./pages/admin/applications";
import AdminActivityLogs from "./pages/admin/activityLogs";
import AdminSettings from "./pages/admin/settings";
import { AdminThemeProvider } from "./pages/admin/AdminThemeContext";

function App(){

  return(


    <BrowserRouter>
      <Routes>


        <Route 
          path="/" 
          element={<Home/>} 
        />

        <Route
  path="/home"
  element={<Home />}
/>


        <Route 
          path="/login" 
          element={<Login/>} 
        />
    

        {/* Register */}
        <Route
          path="/register"
          element={<Register />}
        />

        <Route
  path="/dashboard"
  element={<ProtectedRoute role="candidate"><Dashboard /></ProtectedRoute>}
/>

        {/* Candidate Dashboard */}
        <Route
          path="/candidate/dashboard"
          element={<ProtectedRoute role="candidate"><Dashboard /></ProtectedRoute>}
        />

        {/* Find Jobs */}
        <Route
          path="/candidate/jobs"
          element={<ProtectedRoute role="candidate"><FindJobs /></ProtectedRoute>}
        />

        {/* Job Details */}
        <Route
          path="/candidate/jobs/:jobId"
          element={<ProtectedRoute role="candidate"><JobDetails /></ProtectedRoute>}
        />

        {/* Candidate Profile */}
        <Route
          path="/candidate/profile"
          element={<ProtectedRoute role="candidate"><Profile /></ProtectedRoute>}
        />

        {/* Candidate Settings */}
        <Route
          path="/candidate/settings"
          element={<ProtectedRoute role="candidate"><Settings /></ProtectedRoute>}
        />

        {/* Candidate Applications */}
        <Route
          path="/candidate/applications"
          element={<ProtectedRoute role="candidate"><Applications /></ProtectedRoute>}
        />
        <Route
          path="/candidate/applications/:applicationId"
          element={<ProtectedRoute role="candidate"><CandidateApplicationDetails /></ProtectedRoute>}
        />

        {/* Candidate Interviews */}
        <Route
          path="/candidate/interviews"
          element={<ProtectedRoute role="candidate"><InterviewsPage /></ProtectedRoute>}
        />

        {/* Career Resources */}
        <Route
          path="/candidate/resources"
          element={<ProtectedRoute role="candidate"><ResourcesPage /></ProtectedRoute>}
        />

        {/* Resume Builder */}
        <Route
          path="/candidate/resources/resume-builder"
          element={<ProtectedRoute role="candidate"><ResumeBuilder /></ProtectedRoute>}
        />

        {/* Interview Tips */}
        <Route
          path="/candidate/resources/interview-tips"
          element={<ProtectedRoute role="candidate"><InterviewTips /></ProtectedRoute>}
        />

        {/* Recruiter Dashboard */}
        <Route
          path="/recruiter/dashboard"
          element={<ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute>}
        />

        {/* Recruiter Post Job */}
        <Route
          path="/recruiter/jobs/new"
          element={<ProtectedRoute role="recruiter"><PostJob /></ProtectedRoute>}
        />

        {/* Recruiter Job Details */}
        <Route
          path="/recruiter/jobs/:jobId"
          element={<ProtectedRoute role="recruiter"><RecruiterJobDetails /></ProtectedRoute>}
        />

        {/* Recruiter Edit Job */}
        <Route
          path="/recruiter/jobs/:jobId/edit"
          element={<ProtectedRoute role="recruiter"><EditJob /></ProtectedRoute>}
        />

        {/* Recruiter Manage Jobs */}
        <Route
          path="/recruiter/jobs"
          element={<ProtectedRoute role="recruiter"><ManageJobs /></ProtectedRoute>}
        />

        {/* Recruiter Application Details */}
        <Route
          path="/recruiter/applications/:applicationId"
          element={<ProtectedRoute role="recruiter"><RecruiterApplicationDetails /></ProtectedRoute>}
        />

        {/* Recruiter Applications */}
        <Route
          path="/recruiter/applications"
          element={<ProtectedRoute role="recruiter"><RecruiterApplications /></ProtectedRoute>}
        />

        {/* Recruiter Interview Details */}
        <Route
          path="/recruiter/interviews/:interviewId"
          element={<ProtectedRoute role="recruiter"><RecruiterInterviewDetails /></ProtectedRoute>}
        />

        {/* Recruiter Schedule Interview */}
        <Route
          path="/recruiter/interviews/schedule/:applicationId"
          element={<ProtectedRoute role="recruiter"><ScheduleInterview /></ProtectedRoute>}
        />

        {/* Recruiter Interviews */}
        <Route
          path="/recruiter/interviews"
          element={<ProtectedRoute role="recruiter"><RecruiterInterviews /></ProtectedRoute>}
        />

        {/* Recruiter Profile */}
        <Route
          path="/recruiter/profile"
          element={<ProtectedRoute role="recruiter"><RecruiterProfile /></ProtectedRoute>}
        />

        {/* Recruiter Settings */}
        <Route
          path="/recruiter/settings"
          element={<ProtectedRoute role="recruiter"><RecruiterSettings /></ProtectedRoute>}
        />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminThemeProvider /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="activity-logs" element={<AdminActivityLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Admin Login */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}

        />

      </Routes>
    </BrowserRouter>


  )

}


export default App;



