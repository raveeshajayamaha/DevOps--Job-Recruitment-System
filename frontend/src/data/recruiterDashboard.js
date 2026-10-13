export const recruiterKpis = [
  {
    label: "Total Jobs",
    value: "12",
    detail: "3 added this month",
    icon: "▣",
    tone: "blue",
  },
  {
    label: "Active Jobs",
    value: "8",
    detail: "2 closing soon",
    icon: "◉",
    tone: "green",
  },
  {
    label: "Total Applications",
    value: "145",
    detail: "18 new this week",
    icon: "♙",
    tone: "purple",
  },
  {
    label: "Upcoming Interviews",
    value: "9",
    detail: "4 scheduled this week",
    icon: "◷",
    tone: "orange",
  },
  {
    label: "Shortlisted Candidates",
    value: "24",
    detail: "6 awaiting review",
    icon: "✓",
    tone: "teal",
  },
];

export const applicationPipeline = [
  { label: "Applied", count: 65, color: "#2563eb" },
  { label: "Screening", count: 32, color: "#7c3aed" },
  { label: "Shortlisted", count: 18, color: "#0891b2" },
  { label: "Interview", count: 9, color: "#ea580c" },
  { label: "Offer", count: 4, color: "#ca8a04" },
  { label: "Hired", count: 2, color: "#16a34a" },
];

export const recentApplications = [
  {
    id: 1,
    candidate: "John Silva",
    initials: "JS",
    job: "Frontend Developer",
    date: "06 Oct 2026",
    status: "Shortlisted",
    statusClass: "shortlisted",
    summary: "React, JavaScript, 3 years experience",
  },
  {
    id: 2,
    candidate: "Sarah Perera",
    initials: "SP",
    job: "Software Engineer",
    date: "05 Oct 2026",
    status: "Under Review",
    statusClass: "review",
    summary: "Node.js, Python, 4 years experience",
  },
  {
    id: 3,
    candidate: "Nimal Fernando",
    initials: "NF",
    job: "Backend Developer",
    date: "04 Oct 2026",
    status: "New",
    statusClass: "new",
    summary: "Node.js, MongoDB, 2 years experience",
  },
  {
    id: 4,
    candidate: "Ayesha Wijesinghe",
    initials: "AW",
    job: "DevOps Engineer",
    date: "03 Oct 2026",
    status: "Interview",
    statusClass: "interview",
    summary: "AWS, Docker, CI/CD, 5 years experience",
  },
];

export const upcomingInterviews = [
  {
    id: 1,
    candidate: "John Silva",
    job: "Frontend Developer",
    date: "10 October 2026",
    time: "10:00 AM",
    type: "Technical Interview",
    status: "Confirmed",
  },
  {
    id: 2,
    candidate: "Sarah Perera",
    job: "Software Engineer",
    date: "12 October 2026",
    time: "02:00 PM",
    type: "Engineering Interview",
    status: "Confirmed",
  },
  {
    id: 3,
    candidate: "Ayesha Wijesinghe",
    job: "DevOps Engineer",
    date: "14 October 2026",
    time: "11:30 AM",
    type: "Culture Interview",
    status: "Pending",
  },
];

export const recruitmentActivity = [
  "John Silva was shortlisted for Frontend Developer",
  "New application received for Software Engineer",
  "Interview scheduled with Sarah Perera",
  'Job posting "DevOps Engineer" received 12 applications',
];
