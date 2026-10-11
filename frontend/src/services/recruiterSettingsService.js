import recruiterSettings from "../data/recruiterSettings";

let settings = { ...recruiterSettings };

function getRecruiterSettings() {
  return { ...settings };
}

function updateRecruiterSettings(updates) {
  settings = { ...settings, ...updates };
  return getRecruiterSettings();
}

function resetRecruiterSettings() {
  settings = { ...recruiterSettings };
  return getRecruiterSettings();
}

export {
  getRecruiterSettings,
  resetRecruiterSettings,
  updateRecruiterSettings,
};
