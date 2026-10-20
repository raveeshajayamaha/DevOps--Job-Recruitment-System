import { Router } from 'express';
import mongoose from 'mongoose';
import Interview, { InterviewRound, interviewStatuses, interviewTypes, validDate, validTime, validLink } from '../models/Interview.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
const validId = value => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value) && mongoose.isValidObjectId(value);
const populated = query => query.populate('candidateId', 'firstName lastName email').populate('recruiterId', 'firstName lastName').populate('jobId', 'title company location recruiter');
const name = user => user ? user.firstName + ' ' + user.lastName : '';
function serialize(item) {
  return {
    id: item.id, applicationId: String(item.applicationId), candidateId: item.candidateId?.id || '',
    recruiterId: item.recruiterId?.id || '', jobId: item.jobId?.id || '',
    candidateName: name(item.candidateId) || 'Candidate unavailable', candidateEmail: item.candidateId?.email || '',
    jobTitle: item.jobId?.title || 'Job no longer available', company: item.jobId?.company || '',
    location: item.jobId?.location || '', interviewer: name(item.recruiterId),
    interviewDate: item.interviewDate, interviewTime: item.interviewTime, interviewType: item.interviewType,
    meetingLink: item.meetingLink, notes: item.notes, round: item.round, status: item.status,
    createdAt: item.createdAt, updatedAt: item.updatedAt,
  };
}
function owns(req, item) {
  return req.user.role === 'candidate' ? item.candidateId?.id === req.user.id
    : req.user.role === 'recruiter' && String(item.jobId?.recruiter) === req.user.id;
}
function validate(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Interview data must be an object');
  const fields = ['interviewDate', 'interviewTime', 'interviewType', 'meetingLink', 'notes'];
  const data = Object.fromEntries(fields.filter(key => Object.hasOwn(body, key)).map(key => [key, body[key]]));
  if ((!partial || 'interviewDate' in data) && !validDate(data.interviewDate)) throw new Error('Provide a valid interview date (YYYY-MM-DD)');
  if ((!partial || 'interviewTime' in data) && !validTime(data.interviewTime)) throw new Error('Provide a valid interview time (HH:mm)');
  if ((!partial || 'interviewType' in data) && !interviewTypes.includes(data.interviewType)) throw new Error('Interview type must be Video Call, Phone Call, or In-person');
  for (const [key, max] of [['meetingLink', 2000], ['notes', 10000]]) {
    if (key in data) {
      if (typeof data[key] !== 'string' || data[key].length > max) throw new Error('Provide valid ' + key + ' (up to ' + max + ' characters)');
      data[key] = data[key].trim();
    }
  }
  if (data.meetingLink && !validLink(data.meetingLink)) throw new Error('Meeting link must use HTTP or HTTPS');
  if (!partial && data.interviewType === 'Video Call' && !data.meetingLink) throw new Error('Meeting link is required for a Video Call');
  if (partial && !Object.keys(data).length) throw new Error('No editable interview fields supplied');
  return data;
}
function input(req, res, partial) {
  try { return validate(req.body, partial); }
  catch (error) { res.status(400).json({ success: false, message: error.message }); return null; }
}
function handleError(error, res, next) {
  if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: Object.values(error.errors).map(item => item.message).join('. ') });
  if (error.code === 11000) return res.status(409).json({ success: false, message: 'Interview scheduling conflicted with another request. Please retry.' });
  next(error);
}
router.post('/', authorize('recruiter'), async (req, res, next) => {
  if (!validId(req.body?.applicationId)) return res.status(400).json({ success: false, message: 'Provide a valid application ID' });
  const data = input(req, res, false); if (!data) return;
  try {
    const application = await Application.findById(req.body.applicationId);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    const job = await Job.findById(application.job);
    if (!job) return res.status(404).json({ success: false, message: 'Related job not found' });
    if (String(job.recruiter) !== req.user.id) return res.status(403).json({ success: false, message: 'Only the owning recruiter can schedule interviews' });
    if (application.status !== 'shortlisted') return res.status(409).json({ success: false, message: 'Application must be shortlisted before scheduling an interview' });
    if (req.body.jobId !== undefined && req.body.jobId !== job.id) return res.status(400).json({ success: false, message: 'Job does not match the application' });
    if (!await User.exists({ _id: application.candidate, role: 'candidate' })) return res.status(404).json({ success: false, message: 'Candidate no longer available' });
    const sequence = await InterviewRound.findOneAndUpdate({ _id: application._id }, { $inc: { round: 1 } }, { upsert: true, returnDocument: 'after' });
    const interview = await Interview.create({ ...data, applicationId: application._id, jobId: job._id, candidateId: application.candidate, recruiterId: req.user._id, round: sequence.round });
    const item = await populated(Interview.findById(interview._id));
    res.status(201).json({ success: true, interview: serialize(item) });
  } catch (error) { handleError(error, res, next); }
});
router.get('/my', authorize('candidate'), async (req, res, next) => {
  try {
    const items = await populated(Interview.find({ candidateId: req.user._id }).sort({ interviewDate: 1, interviewTime: 1, _id: 1 }));
    res.json({ success: true, interviews: items.map(serialize) });
  } catch (error) { next(error); }
});
router.get('/recruiter', authorize('recruiter'), async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).select('_id');
    const filter = { jobId: { $in: jobs.map(job => job._id) } };
    if (req.query.applicationId !== undefined) {
      if (!validId(req.query.applicationId)) return res.status(400).json({ success: false, message: 'Provide a valid application ID' });
      filter.applicationId = req.query.applicationId;
    }
    const items = await populated(Interview.find(filter).sort({ interviewDate: 1, interviewTime: 1, _id: 1 }));
    res.json({ success: true, interviews: items.map(serialize) });
  } catch (error) { next(error); }
});
router.use('/:id', (req, res, next) => {
  if (!validId(req.params.id)) return res.status(404).json({ success: false, message: 'Interview not found' });
  next();
});
router.get('/:id', authorize('candidate', 'recruiter'), async (req, res, next) => {
  try {
    const item = await populated(Interview.findById(req.params.id));
    if (!item) return res.status(404).json({ success: false, message: 'Interview not found' });
    if (!owns(req, item)) return res.status(403).json({ success: false, message: 'Access denied' });
    res.json({ success: true, interview: serialize(item) });
  } catch (error) { next(error); }
});
async function update(req, res, next, statusOnly) {
  try {
    const item = await populated(Interview.findById(req.params.id));
    if (!item) return res.status(404).json({ success: false, message: 'Interview not found' });
    if (!owns(req, item)) return res.status(403).json({ success: false, message: 'Only the owning recruiter can update this interview' });
    if (statusOnly) {
      if (!interviewStatuses.includes(req.body?.status)) return res.status(400).json({ success: false, message: 'Status must be scheduled, completed, or cancelled' });
      item.status = req.body.status;
    } else {
      const data = input(req, res, true); if (!data) return;
      Object.assign(item, data);
    }
    await item.save();
    res.json({ success: true, interview: serialize(item) });
  } catch (error) { handleError(error, res, next); }
}
router.patch('/:id/status', authorize('recruiter'), (req, res, next) => update(req, res, next, true));
router.patch('/:id', authorize('recruiter'), (req, res, next) => update(req, res, next, false));
export default router;
