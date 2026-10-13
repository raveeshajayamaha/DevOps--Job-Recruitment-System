import { BrowserRouter, Routes, Route } from "react-router-dom";

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
  element={<Dashboard />}
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

        {/* Candidate Profile */}
        <Route
          path="/candidate/profile"
          element={<Profile />}
        />

        {/* Candidate Settings */}
        <Route
          path="/candidate/settings"
          element={<Settings />}
        />

        {/* Candidate Applications */}
        <Route
          path="/candidate/applications"
          element={<Applications />}
        />
        <Route
          path="/candidate/applications/:applicationId"
          element={<CandidateApplicationDetails />}
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

        {/* Recruiter Dashboard */}
        <Route
          path="/recruiter/dashboard"
          element={<RecruiterDashboard />}
        />

        {/* Recruiter Post Job */}
        <Route
          path="/recruiter/jobs/new"
          element={<PostJob />}
        />

        {/* Recruiter Job Details */}
        <Route
          path="/recruiter/jobs/:jobId"
          element={<RecruiterJobDetails />}
        />

        {/* Recruiter Edit Job */}
        <Route
          path="/recruiter/jobs/:jobId/edit"
          element={<EditJob />}
        />

        {/* Recruiter Manage Jobs */}
        <Route
          path="/recruiter/jobs"
          element={<ManageJobs />}
        />

        {/* Recruiter Application Details */}
        <Route
          path="/recruiter/applications/:applicationId"
          element={<RecruiterApplicationDetails />}
        />

        {/* Recruiter Applications */}
        <Route
          path="/recruiter/applications"
          element={<RecruiterApplications />}
        />

        {/* Recruiter Interview Details */}
        <Route
          path="/recruiter/interviews/:interviewId"
          element={<RecruiterInterviewDetails />}
        />

        {/* Recruiter Schedule Interview */}
        <Route
          path="/recruiter/interviews/schedule/:applicationId"
          element={<ScheduleInterview />}
        />

        {/* Recruiter Interviews */}
        <Route
          path="/recruiter/interviews"
          element={<RecruiterInterviews />}
        />

        {/* Recruiter Profile */}
        <Route
          path="/recruiter/profile"
          element={<RecruiterProfile />}
        />

        {/* Recruiter Settings */}
        <Route
          path="/recruiter/settings"
          element={<RecruiterSettings />}
        />

        {/* Admin Dashboard */}
        {/* Preview route only: protect production access with backend authentication and Admin-role authorization. */}
        <Route path="/admin" element={<AdminThemeProvider />}>
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



