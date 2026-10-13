import recruiterInterviews from "../data/recruiterInterviews";

let interviews = recruiterInterviews;

function cloneInterview(interview) {
  return interview ? { ...interview } : undefined;
}

function getInterviews() {
  return interviews.map(cloneInterview);
}

function getInterviewById(id) {
  return cloneInterview(
    interviews.find((interview) => String(interview.id) === String(id)),
  );
}

function getInterviewsByApplicationId(applicationId) {
  return interviews
    .filter((interview) => String(interview.applicationId) === String(applicationId))
    .map(cloneInterview);
}

function createInterview(interviewData) {
  const newInterview = {
    ...interviewData,
    id: getNextInterviewId(),
    round:
      interviewData.round ??
      interviews.filter(
        (interview) =>
          String(interview.applicationId) === String(interviewData.applicationId),
      ).length + 1,
    status: interviewData.status ?? "scheduled",
  };

  interviews = [...interviews, newInterview];
  return cloneInterview(newInterview);
}

function updateInterview(id, updates) {
  const interview = getInterviewById(id);

  if (!interview) {
    return undefined;
  }

  const updatedInterview = { ...interview, ...updates, id: interview.id };
  interviews = interviews.map((currentInterview) =>
    currentInterview.id === interview.id ? updatedInterview : currentInterview,
  );
  return cloneInterview(updatedInterview);
}

function updateInterviewStatus(id, status) {
  return updateInterview(id, { status });
}

function getNextInterviewId() {
  return interviews.reduce(
    (highestId, interview) => Math.max(highestId, Number(interview.id) || 0),
    0,
  ) + 1;
}

export {
  createInterview,
  getInterviewById,
  getInterviews,
  getInterviewsByApplicationId,
  updateInterview,
  updateInterviewStatus,
};
