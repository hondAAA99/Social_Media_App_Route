import mongoose, { model } from 'mongoose';
import { postSchema } from './posts.schema.js';
const postModel = mongoose.models.posts || model('posts', postSchema);
export default postModel;
