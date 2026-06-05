import mongoose, { Schema } from 'mongoose'
import onModelEnum from '../../common/enum/onModel.enum.js'

interface IReactCount {
  total: number
  like: number
  love: number
  sad: number
  angry: number
  care: number
  wow: number
}

interface IReactedUser {
  userId: Schema.Types.ObjectId
  react: string
}

interface IReacts {
  reactsCount: IReactCount
  reactedUsers: IReactedUser[]
}

export interface IComment {
  id: Schema.Types.ObjectId
  content: string | undefined
  attachments: string[]
  createdBy: Schema.Types.ObjectId
  tags: Schema.Types.ObjectId[]
  folderId: string
  refId: Schema.Types.ObjectId
  onModel: string
  reacts: IReacts
  hideComment: boolean
}

const reactCountSchema = new Schema<IReactCount>({
  total: { type: Number },
  like: { type: Number },
  love: { type: Number },
  sad: { type: Number },
  angry: { type: Number },
  care: { type: Number },
  wow: { type: Number },
})

const reactedUserSchema = new Schema<IReactedUser>({
  userId: Schema.Types.ObjectId,
  react: String,
})

const reactsSchema = new Schema<IReacts>({
  reactsCount: reactCountSchema,
  reactedUsers: {
    type: [reactedUserSchema],
  },
})

const commentSchema = new Schema<IComment>({
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
})

commentSchema.virtual('replies', {
  ref: 'comment',
  localField: '_id',
  foreignField: 'refId',
})

const commentModel =
  mongoose.models.messages || mongoose.model('messages', commentSchema)

export default commentModel
