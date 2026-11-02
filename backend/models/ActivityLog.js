import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  actorName: { type: String, required: true, maxlength: 210 },
  actorRole: { type: String, enum: ['candidate', 'recruiter', 'admin'], required: true },
  action: { type: String, required: true, maxlength: 100 },
  category: { type: String, enum: ['User', 'Job', 'Application', 'Interview'], required: true, index: true },
  targetType: { type: String, required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetDescription: { type: String, maxlength: 250, default: '' },
  timestamp: { type: Date, default: Date.now, index: true },
}, { versionKey: false });
schema.index({ timestamp: -1, _id: -1 });
export default mongoose.model('ActivityLog', schema);
