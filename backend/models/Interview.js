import mongoose from 'mongoose';

export const interviewStatuses = ['scheduled', 'completed', 'cancelled'];
export const interviewTypes = ['Video Call', 'Phone Call', 'In-person'];
export const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
export const validTime = value => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
export function validLink(value) {
  try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; }
}
const reference = ref => ({ type: mongoose.Schema.Types.ObjectId, ref, required: true, immutable: true });
const schema = new mongoose.Schema({
  applicationId: reference('Application'), candidateId: reference('User'),
  recruiterId: reference('User'), jobId: reference('Job'),
  interviewDate: { type: String, required: true, validate: validDate },
  interviewTime: { type: String, required: true, validate: validTime },
  interviewType: { type: String, required: true, enum: interviewTypes },
  meetingLink: { type: String, trim: true, maxlength: 2000, default: '' },
  notes: { type: String, trim: true, maxlength: 10000, default: '' },
  round: { type: Number, required: true, min: 1, immutable: true },
  status: { type: String, enum: interviewStatuses, default: 'scheduled', required: true },
}, { timestamps: true });
schema.pre('validate', function () {
  if ((this.interviewType === 'Video Call' || this.meetingLink) && !validLink(this.meetingLink)) this.invalidate('meetingLink', 'Provide an HTTP(S) meeting link for a Video Call');
});
schema.index({ applicationId: 1, round: -1 });
schema.index({ candidateId: 1, interviewDate: 1 });
schema.index({ jobId: 1, interviewDate: 1 });
// Atomic per-application sequence; gaps after failed writes are harmless.
// The Interview collection deliberately has no unique application index.
export const InterviewRound = mongoose.model('InterviewRound', new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  round: { type: Number, default: 0 },
}, { versionKey: false }));
export default mongoose.model('Interview', schema);
