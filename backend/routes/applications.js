import { Router } from 'express';
import mongoose from 'mongoose';
import Application, { applicationStatuses } from '../models/Application.js';
import Job from '../models/Job.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
const validId = value => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value) && mongoose.isValidObjectId(value);
const populated = query => query.populate('candidate', 'firstName lastName email').populate('job', 'title company location jobType recruiter');
const dateOnly = value => value?.toISOString().slice(0, 10) || '';
function serialize(application) {
  const { candidate, job } = application;
  return {
    id: application.id, candidateId: candidate?.id || '', jobId: job?.id || '',
    candidateName: candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Candidate unavailable',
    email: candidate?.email || '', jobTitle: job?.title || 'Job no longer available',
    company: job?.company || '', location: job?.location || '', jobType: job?.jobType || '',
    status: application.status, appliedDate: dateOnly(application.appliedDate), lastUpdated: dateOnly(application.lastUpdated),
    experience: '', skills: [], resume: '',
  };
}
function owns(req, application) {
  return req.user.role === 'candidate'
    ? application.candidate?.id === req.user.id
    : req.user.role === 'recruiter' && String(application.job?.recruiter) === req.user.id;
}
router.post('/', authorize('candidate'), async (req, res, next) => {
  if (!validId(req.body?.jobId)) return res.status(400).json({ success: false, message: 'Provide a valid job ID' });
  try {
    const job = await Job.findById(req.body.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.status !== 'active') return res.status(400).json({ success: false, message: 'This job is no longer accepting applications.' });
    const application = await Application.create({ candidate: req.user._id, job: job._id });
    await application.populate([
      { path: 'candidate', select: 'firstName lastName email' },
      { path: 'job', select: 'title company location jobType recruiter' },
    ]);
    res.status(201).json({ success: true, message: 'Application submitted successfully.', application: serialize(application) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'You have already applied for this job.' });
    next(error);
  }
});
router.get('/my', authorize('candidate'), async (req, res, next) => {
  try {
    const applications = await populated(Application.find({ candidate: req.user._id }).sort({ appliedDate: -1, _id: -1 }));
    res.json({ success: true, applications: applications.map(serialize) });
  } catch (error) { next(error); }
});
router.get('/recruiter', authorize('recruiter'), async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).select('_id');
    const applications = await populated(Application.find({ job: { $in: jobs.map(job => job._id) } }).sort({ appliedDate: -1, _id: -1 }));
    res.json({ success: true, applications: applications.map(serialize) });
  } catch (error) { next(error); }
});
router.use('/:applicationId', (req, res, next) => {
  if (!validId(req.params.applicationId)) return res.status(404).json({ success: false, message: 'Application not found' });
  next();
});
router.get('/:applicationId', authorize('candidate', 'recruiter'), async (req, res, next) => {
  try {
    const application = await populated(Application.findById(req.params.applicationId));
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (!owns(req, application)) return res.status(403).json({ success: false, message: 'Access denied' });
    res.json({ success: true, application: serialize(application) });
  } catch (error) { next(error); }
});
router.patch('/:applicationId/status', authorize('recruiter'), async (req, res, next) => {
  try {
    const application = await populated(Application.findById(req.params.applicationId));
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (!owns(req, application)) return res.status(403).json({ success: false, message: 'Access denied' });
    if (!applicationStatuses.includes(req.body?.status)) return res.status(400).json({ success: false, message: 'Status must be pending, shortlisted, interview, or rejected' });
    application.status = req.body.status;
    await application.save();
    res.json({ success: true, message: 'Application status updated.', application: serialize(application) });
  } catch (error) { next(error); }
});
export default router;
