import mongoose from 'mongoose';

export const applicationStatuses = ['pending', 'shortlisted', 'interview', 'rejected'];
const applicationSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, immutable: true },
  status: { type: String, enum: applicationStatuses, default: 'pending', required: true },
}, { timestamps: { createdAt: 'appliedDate', updatedAt: 'lastUpdated' } });
applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });
applicationSchema.index({ job: 1, appliedDate: -1 });
export default mongoose.model('Application', applicationSchema);
