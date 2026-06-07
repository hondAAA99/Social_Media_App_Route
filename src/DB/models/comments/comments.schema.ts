import mongoose, { Schema } from 'mongoose'
import onModelEnum from '../../../common/enum/onModel.enum.js'
import { IComment } from './comment.interface.js'
import { reactsSchema } from '../posts/posts.schema.js'
import CommentSchemaHelpersCalling from './schema.helpers.js'

export const commentSchema = new Schema<IComment>({
  tags: [{ type: Schema.Types.ObjectId }],
  attachments: {
    type: [String],
    required: function (this) {
      return this.content ? false : true
    },
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'users',
  },
  content: {
    type: String,
    required: function (this) {
      return this.attachments ? false : true
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
  deletedAt: { type: Date },
  deletedBy: { type: Schema.Types.ObjectId, ref: 'users' },
})

CommentSchemaHelpersCalling()
