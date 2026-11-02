import mongoose from 'mongoose';
// One bounded private PDF per candidate; no public filesystem or external service.
const schema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true, maxlength: 150 },
  data: { type: Buffer, required: true, select: false },
  size: { type: Number, required: true, max: 2 * 1024 * 1024 },
}, { timestamps: true });
export default mongoose.model('Resume', schema);
