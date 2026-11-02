import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Job, { jobTypes } from '../models/Job.js';
import Application, { applicationStatuses } from '../models/Application.js';
import ActivityLog from '../models/ActivityLog.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, authorize('admin'));
router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
const fail = message => Object.assign(new Error(message), { status: 400 });
const regex = value => ({ $regex: value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' });
function query(req, allowed) {
  if (Object.keys(req.query).some(key => ![...allowed, 'page', 'limit'].includes(key))) throw fail('Unsupported filters');
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value !== 'string' || value.length > 200) throw fail('Invalid filter');
    if (['page', 'limit'].includes(key) && (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)))) throw fail('Invalid pagination');
  }
  const page = Number(req.query.page || 1), limit = Number(req.query.limit || 100);
  if (limit > 100 || page > 100000) throw fail('Pagination out of range');
  return { page, limit };
}
function enumFilter(req, filter, key, values) {
  if (req.query[key]) {
    if (!values.includes(req.query[key])) throw fail(`Invalid ${key}`);
    filter[key] = req.query[key];
  }
}
const day = value => value?.toISOString().slice(0, 10) || '';
const userValue = user => ({ id: user.id, firstName: user.firstName, lastName: user.lastName,
  name: `${user.firstName} ${user.lastName}`, email: user.email, role: user.role,
  status: user.status || 'active', registered: day(user.createdAt) });
function jobValue(job) {
  const value = job.toObject();
  delete value.__v;
  return { ...value, id: job.id, postedDate: day(job.postedDate), deadline: day(job.deadline) };
}
const populateApplication = q => q.populate('candidate', 'firstName lastName email profile').populate('job', 'title company');
function applicationValue(item) {
  return { id: item.id, candidateId: item.candidate?.id || '', candidateName: item.candidate ? `${item.candidate.firstName} ${item.candidate.lastName}` : 'Candidate unavailable',
    email: item.candidate?.email || '', jobTitle: item.job?.title || 'Job no longer available', company: item.job?.company || '',
    status: item.status, appliedDate: day(item.appliedDate), experience: item.candidate?.profile?.experience || '',
    skills: (item.candidate?.profile?.skills || '').split(',').filter(Boolean), resume: '' };
}
const activityValue = item => ({ id: item.id, actorId: String(item.actor || ''), actor: item.actorName,
  actorRole: item.actorRole, category: item.category, action: item.action, target: item.targetDescription || item.targetType,
  targetId: String(item.targetId), timestamp: item.timestamp, date: day(item.timestamp), time: item.timestamp.toISOString().slice(11, 16) });
async function list(res, model, filter, pagination, key, serialize, decorate = q => q, dateField = 'createdAt') {
  const { page, limit } = pagination;
  const [total, items] = await Promise.all([model.countDocuments(filter), decorate(model.find(filter).sort({ [dateField]: -1, _id: -1 }).skip((page - 1) * limit).limit(limit))]);
  res.json({ success: true, [key]: items.map(serialize), total, page, limit });
}
router.get('/dashboard', async (req, res) => {
  query(req, []);
  const [users, jobs, applications, recent] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Job.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ActivityLog.find().sort({ timestamp: -1, _id: -1 }).limit(10),
  ]);
  const counts = rows => Object.fromEntries(rows.map(row => [row._id, row.count]));
  const roles = counts(users), jobStatuses = counts(jobs), applicationCounts = counts(applications);
  const sum = rows => rows.reduce((n, row) => n + row.count, 0);
  res.json({ success: true, dashboard: { totalUsers: sum(users), candidates: roles.candidate || 0,
    recruiters: roles.recruiter || 0, admins: roles.admin || 0, totalJobs: sum(jobs), totalApplications: sum(applications),
    jobStatuses, applicationStatuses: applicationCounts, recentActivity: recent.map(activityValue) } });
});
router.get('/users', async (req, res) => {
  const pagination = query(req, ['search', 'role', 'status']), filter = {};
  enumFilter(req, filter, 'role', ['candidate', 'recruiter', 'admin']);
  enumFilter(req, filter, 'status', ['active', 'inactive']);
  // Legacy users without a stored status remain active.
  if (filter.status === 'active') { delete filter.status; filter.$and = [{ $or: [{ status: 'active' }, { status: { $exists: false } }] }]; }
  if (req.query.search?.trim()) filter.$or = ['firstName', 'lastName', 'email'].map(key => ({ [key]: regex(req.query.search.trim()) }));
  await list(res, User, filter, pagination, 'users', userValue);
});
router.get('/jobs', async (req, res) => {
  const pagination = query(req, ['search', 'status', 'jobType']), filter = {};
  enumFilter(req, filter, 'status', ['active', 'closed']); enumFilter(req, filter, 'jobType', jobTypes);
  if (req.query.search?.trim()) filter.$or = ['title', 'company', 'location'].map(key => ({ [key]: regex(req.query.search.trim()) }));
  await list(res, Job, filter, pagination, 'jobs', jobValue);
});
router.get('/applications', async (req, res) => {
  const pagination = query(req, ['search', 'status']), filter = {};
  enumFilter(req, filter, 'status', applicationStatuses);
  if (req.query.search?.trim()) {
    const pattern = regex(req.query.search.trim());
    const [users, jobs] = await Promise.all([User.find({ $or: ['firstName', 'lastName', 'email'].map(key => ({ [key]: pattern })) }).select('_id'), Job.find({ $or: [{ title: pattern }, { company: pattern }] }).select('_id')]);
    filter.$or = [{ candidate: { $in: users.map(user => user._id) } }, { job: { $in: jobs.map(job => job._id) } }];
  }
  await list(res, Application, filter, pagination, 'applications', applicationValue, populateApplication, 'appliedDate');
});
router.get('/activity-logs', async (req, res) => {
  const pagination = query(req, ['search', 'category', 'actor', 'days']), filter = {};
  enumFilter(req, filter, 'category', ['User', 'Job', 'Application', 'Interview']);
  if (req.query.actor) {
    if (!/^[a-f\d]{24}$/i.test(req.query.actor)) throw fail('Invalid actor ID');
    filter.actor = req.query.actor;
  }
  if (req.query.days) {
    if (!['7', '30'].includes(req.query.days)) throw fail('Invalid date range');
    filter.timestamp = { $gte: new Date(Date.now() - Number(req.query.days) * 86400000) };
  }
  if (req.query.search?.trim()) filter.$or = ['actorName', 'action', 'targetDescription'].map(key => ({ [key]: regex(req.query.search.trim()) }));
  await list(res, ActivityLog, filter, pagination, 'activities', activityValue, q => q, 'timestamp');
});
for (const [path, model, key, serialize, decorate] of [
  ['users', User, 'user', userValue, q => q], ['jobs', Job, 'job', jobValue, q => q],
  ['applications', Application, 'application', applicationValue, populateApplication],
]) {
  router.get(`/${path}/:id`, async (req, res) => {
    if (!/^[a-f\d]{24}$/i.test(req.params.id) || !mongoose.isValidObjectId(req.params.id)) throw fail('Invalid ID');
    const item = await decorate(model.findById(req.params.id));
    if (!item) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, [key]: serialize(item) });
  });
}
export default router;
