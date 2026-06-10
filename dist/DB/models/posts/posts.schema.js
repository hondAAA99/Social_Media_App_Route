import mongoose, { Schema } from 'mongoose';
import availabiltyEnum from '../../../common/enum/availablity.enum.js';
import { LikeCountAvailability as hideLikeCount } from '../../../common/enum/post_comment.base.enum.js';
import postsSchemaHelpersCalling from './schema.helpers.js';
export const reactCountSchema = new Schema({
    total: { type: Number },
    like: { type: Number },
    love: { type: Number },
    sad: { type: Number },
    angry: { type: Number },
    care: { type: Number },
    wow: { type: Number },
});
const reactedUserSchema = new Schema({
    userId: Schema.Types.ObjectId,
    react: String,
});
export const reactsSchema = new Schema({
    reactAviliablity: { type: String, default: hideLikeCount.show },
    reactsCount: reactCountSchema,
    reactedUsers: {
        type: [reactedUserSchema],
    },
});
export const postSchema = new mongoose.Schema({
    tags: [{ type: Schema.Types.ObjectId }],
    deletedBy: { type: Schema.Types.ObjectId },
    attachments: [
        {
            type: String,
            required: function () {
                return this.content ? false : true;
            },
        },
    ],
    content: {
        type: String,
        required: function () {
            return this.attachments ? false : true;
        },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    allowComments: { type: String, required: true },
    availablity: { type: String, enum: availabiltyEnum, required: true },
    folderId: { type: String, required: true },
    reacts: reactsSchema,
    deletedAt: { type: Date },
});
postsSchemaHelpersCalling();
