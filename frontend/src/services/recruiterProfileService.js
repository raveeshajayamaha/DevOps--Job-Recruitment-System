import recruiterProfile from "../data/recruiterProfile";

let profile = { ...recruiterProfile };

function getRecruiterProfile() {
  return { ...profile };
}

function updateRecruiterProfile(updates) {
  profile = { ...profile, ...updates, id: profile.id };
  return getRecruiterProfile();
}

export { getRecruiterProfile, updateRecruiterProfile };
