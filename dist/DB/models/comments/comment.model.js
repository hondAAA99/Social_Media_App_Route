import mongoose, { model } from 'mongoose';
import { commentSchema } from './comments.schema.js';
const commentModel = mongoose.models.messages || model('messages', commentSchema);
export default commentModel;
