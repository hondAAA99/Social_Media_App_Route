import { Schema } from 'mongoose';
import onModelEnum from '../../../common/enum/onModel.enum.js';
import { reactsSchema } from '../posts/posts.schema.js';
import CommentSchemaHelpersCalling from './schema.helpers.js';
export const commentSchema = new Schema({
    tags: [{ type: Schema.Types.ObjectId }],
    attachments: {
        type: [String],
        required: function () {
            return this.content ? false : true;
        },
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'users',
    },
    content: {
        type: String,
        required: function () {
            return this.attachments ? false : true;
        },
    },
    refId: { type: Schema.Types.ObjectId, refPath: 'onModel', required: true },
    onModel: { type: String, enum: onModelEnum, required: true },
    folderId: { type: String },
    reacts: reactsSchema,
    hideComment: {
        type: Boolean,
        default: false,
    },
});
CommentSchemaHelpersCalling();
