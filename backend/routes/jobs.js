import { Router } from 'express';
import mongoose from 'mongoose';
import Job, { jobTypes, experienceLevels } from '../models/Job.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
const fields = ['title', 'company', 'location', 'jobType', 'salaryMin', 'salaryMax', 'experienceLevel', 'description', 'requirements', 'skills', 'deadline', 'status'];
const normalizeType = value => ({ 'Full Time': 'Full-time', 'Part Time': 'Part-time' }[value] || value);
const dateOnly = value => value?.toISOString().slice(0, 10);
function serialize(job) {
  const value = job.toObject();
  delete value.__v;
  return { ...value, id: String(job._id), recruiter: String(job.recruiter), postedDate: dateOnly(job.postedDate), deadline: dateOnly(job.deadline) };
}
function validate(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Job data must be an object');
  const data = Object.fromEntries(fields.filter(key => Object.hasOwn(body, key)).map(key => [key, body[key]]));
  for (const [key, max] of Object.entries({ title: 200, company: 200, location: 200, description: 20000 })) {
    if ((!partial || key in data) && (typeof data[key] !== 'string' || !data[key].trim() || data[key].trim().length > max)) throw new Error(`Provide a valid ${key} (up to ${max} characters)`);
  }
  if ('jobType' in data) data.jobType = normalizeType(data.jobType);
  for (const [key, choices] of [['jobType', jobTypes], ['experienceLevel', experienceLevels], ['status', ['active', 'closed']]]) {
    if (((!partial && key !== 'status') || key in data) && !choices.includes(data[key])) throw new Error(`Invalid ${key}`);
  }
  for (const key of ['salaryMin', 'salaryMax']) {
    if (key in data && (typeof data[key] !== 'number' || !Number.isFinite(data[key]) || data[key] < 0)) throw new Error('Salaries must be non-negative numbers');
  }
  for (const key of ['requirements', 'skills']) {
    if ((key === 'requirements' && !partial) || key in data) {
      if (!Array.isArray(data[key]) || data[key].length > 100 || (key === 'requirements' && !data[key].length) || data[key].some(v => typeof v !== 'string' || !v.trim() || v.trim().length > (key === 'skills' ? 100 : 1000))) throw new Error(`Provide valid ${key} as an array of strings`);
    }
  }
  if (!partial || 'deadline' in data) {
    if (typeof data.deadline !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.deadline) || !Number.isFinite(Date.parse(data.deadline)) || new Date(data.deadline).toISOString().slice(0, 10) !== data.deadline) throw new Error('Provide a valid application deadline (YYYY-MM-DD)');
  }
  if (partial && !Object.keys(data).length) throw new Error('No editable job fields supplied');
  return data;
}
function input(req, res, partial) {
  try { return validate(req.body, partial); }
  catch (error) { res.status(400).json({ success: false, message: error.message }); return null; }
}
function handleError(error, res, next) {
  if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: Object.values(error.errors).map(e => e.message).join('. ') });
  next(error);
}
async function findJob(req, res) {
  const job = await Job.findById(req.params.jobId);
  if (!job) res.status(404).json({ success: false, message: 'Job not found' });
  return job;
}
function owns(req, res, job) {
  if (String(job.recruiter) === req.user.id) return true;
  res.status(403).json({ success: false, message: 'Access denied. Only the owning recruiter can manage this job.' });
  return false;
}
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
router.get('/', async (req, res, next) => {
  try {
    const filter = { status: 'active' };
    if (Object.keys(req.query).some(key => !['search', 'location', 'jobType'].includes(key))) return res.status(400).json({ success: false, message: 'Invalid search filters' });
    for (const key of ['search', 'location', 'jobType']) {
      if (req.query[key] !== undefined && (typeof req.query[key] !== 'string' || req.query[key].length > 200)) return res.status(400).json({ success: false, message: 'Invalid search filters' });
    }
    if (req.query.search?.trim()) {
      const pattern = { $regex: escapeRegex(req.query.search.trim()), $options: 'i' };
      filter.$or = [{ title: pattern }, { company: pattern }];
    }
    if (req.query.location?.trim()) filter.location = { $regex: escapeRegex(req.query.location.trim()), $options: 'i' };
    if (req.query.jobType && req.query.jobType !== 'All Types') filter.jobType = normalizeType(req.query.jobType);
    const jobs = await Job.find(filter).sort({ createdAt: -1, _id: -1 });
    res.json({ success: true, jobs: jobs.map(serialize) });
  } catch (error) { next(error); }
});
// Keep /my before the dynamic ID route.
router.get('/my', authorize('recruiter'), async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1, _id: -1 });
    res.json({ success: true, jobs: jobs.map(serialize) });
  } catch (error) { next(error); }
});
router.post('/', authorize('recruiter'), async (req, res, next) => {
  const data = input(req, res, false);
  if (!data) return;
  try {
    const job = await Job.create({ ...data, recruiter: req.user._id });
    res.status(201).json({ success: true, message: 'Job posted successfully', job: serialize(job) });
  } catch (error) { handleError(error, res, next); }
});
router.use('/:jobId', (req, res, next) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.jobId) || !mongoose.isValidObjectId(req.params.jobId)) return res.status(400).json({ success: false, message: 'Invalid job ID' });
  next();
});
router.get('/:jobId', async (req, res, next) => {
  try {
    const job = await findJob(req, res);
    if (!job) return;
    if (req.user.role === 'recruiter') { if (!owns(req, res, job)) return; }
    else if (job.status !== 'active') return res.status(404).json({ success: false, message: 'Job not found or no longer available' });
    res.json({ success: true, job: serialize(job) });
  } catch (error) { next(error); }
});
router.put('/:jobId', authorize('recruiter'), async (req, res, next) => {
  try {
    const job = await findJob(req, res);
    if (!job || !owns(req, res, job)) return;
    const data = input(req, res, true);
    if (!data) return;
    job.set(data);
    await job.save();
    res.json({ success: true, message: 'Job updated successfully', job: serialize(job) });
  } catch (error) { handleError(error, res, next); }
});
router.patch('/:jobId/status', authorize('recruiter'), async (req, res, next) => {
  try {
    const job = await findJob(req, res);
    if (!job || !owns(req, res, job)) return;
    if (!['active', 'closed'].includes(req.body?.status)) return res.status(400).json({ success: false, message: 'Status must be active or closed' });
    job.status = req.body.status;
    await job.save();
    res.json({ success: true, message: 'Job status updated', job: serialize(job) });
  } catch (error) { handleError(error, res, next); }
});
router.delete('/:jobId', authorize('recruiter'), async (req, res, next) => {
  try {
    const job = await findJob(req, res);
    if (!job || !owns(req, res, job)) return;
    await job.deleteOne();
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) { next(error); }
});
export default router;
