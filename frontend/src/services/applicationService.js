import recruiterApplications from "../data/recruiterApplications";

let applications = recruiterApplications;

function cloneApplication(application) {
  return application
    ? { ...application, skills: [...application.skills] }
    : undefined;
}

function getApplications() {
  return applications.map(cloneApplication);
}

function getApplicationById(id) {
  return cloneApplication(
    applications.find((application) => String(application.id) === String(id)),
  );
}

function updateApplicationStatus(id, status) {
  const application = applications.find(
    (currentApplication) => String(currentApplication.id) === String(id),
  );

  if (!application) {
    return undefined;
  }

  application.status = status;
  return cloneApplication(application);
}

export {
  getApplications,
  getApplicationById,
  updateApplicationStatus,
};
