import mongoose, { model, Schema } from 'mongoose'
import availabiltyEnum from '../../common/enum/availablity.enum.js'

interface IStoryView {
  userId: Schema.Types.ObjectId
  viewDate: Date
}

export interface IStory {
  id: Schema.Types.ObjectId
  createdBy: Schema.Types.ObjectId
  url: string
  text: string
  backGroundColour: string
  createdAt: Date
  updatedAt: Date
  expiresAt: number
  excludeUsers: Schema.Types.ObjectId[]
  views: IStoryView[]
  availiabilty: string
}
const storyViewSchema = new Schema<IStoryView>({
  userId: { type: Schema.Types.ObjectId, required: true },
  viewDate: { type: Date, required: true },
})

const storySchema = new Schema<IStory>({
  createdBy: { type: Schema.Types.ObjectId, required: true },
  url: { type: String },
  text: { type: String },
  backGroundColour: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
  expiresAt: { type: Number, required: true },
  excludeUsers: { type: [Schema.Types.ObjectId] },
  views: { type: [storyViewSchema] },
  availiabilty: {
    type: String,
    enum: Object.values(availabiltyEnum),
    default: availabiltyEnum.public,
    required: true,
  },
})

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const storyModel = mongoose.models.stories || model('stories', storySchema)

export default storyModel
