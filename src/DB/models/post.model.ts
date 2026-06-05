import mongoose, { Schema } from 'mongoose'
import availabiltyEnum from '../../common/enum/availablity.enum.js'
import reactsEnum from '../../common/enum/reactEnum.js'
import hideLikeCount from '../../common/enum/hideLikeCounts.enum.js'

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
  reactAviliablity: string
  reactsCount: IReactCount
  reactedUsers: IReactedUser[]
}

export interface IPost {
  id: Schema.Types.ObjectId
  content: string
  attachments?: string[]
  createdBy: Schema.Types.ObjectId
  tags?: Schema.Types.ObjectId[]
  allowComments?: string
  availablity: string
  folderId: string
  reacts: IReacts
  deletedAt: Date
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
  reactAviliablity: { type: String, default: hideLikeCount.show },
  reactsCount: reactCountSchema,
  reactedUsers: {
    type: [reactedUserSchema],
  },
})

const postSchema = new mongoose.Schema<IPost>({
  tags: [{ type: Schema.Types.ObjectId }],
  attachments: [
    {
      type: String,
      required: function (this) {
        return this.content ? false : true
      },
    },
  ],
  content: {
    type: String,
    required: function (this) {
      return this.attachments ? false : true
    },
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  allowComments: { type: String, required: true },
  availablity: { type: String, enum: availabiltyEnum, required: true },
  folderId: { type: String, required: true },
  reacts: reactsSchema,
  deletedAt: { type: Date },
})

postSchema.pre(['findOne', 'find'], function () {
  const { paranoid, ...rest } = this.getQuery()
  if (paranoid == true) {
    // soft delete
    this.setQuery({ deleteAt: { $exists: false }, rest })
  } else this.setQuery({ rest })
})

postSchema.pre(
  ['deleteMany', 'deleteOne', 'findOneAndDelete'],
  async function () {
    const condition = this.getQuery()
    const userId = condition.createdBy
    await Promise.all([
      mongoose.models.comments!.deleteMany({
        createdBy: userId,
      }),
    ])
  },
)

postSchema.virtual('comments', {
  ref: 'comments',
  localField: '_id',
  foreignField: 'refId',
})

const postModel = mongoose.models.posts || mongoose.model('posts', postSchema)

export default postModel
