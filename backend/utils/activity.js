import ActivityLog from '../models/ActivityLog.js';
// Explicit fields only: never persist request bodies, credentials, or tokens.
export async function recordActivity(user, action, category, targetType, targetId, description = '') {
  try {
    await ActivityLog.create({ actor: user._id, actorName: `${user.firstName} ${user.lastName}`,
      actorRole: user.role, action, category, targetType, targetId,
      targetDescription: description.slice(0, 250) });
  } catch {
    // The business mutation has already succeeded. Do not invite a duplicate retry.
    console.error('Activity record could not be persisted');
  }
}
