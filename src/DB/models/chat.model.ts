import mongoose, { model, Schema } from 'mongoose'

interface IMessage {
  createdBy: Schema.Types.ObjectId
  content: string
}

export interface IChat {
  createdBy: Schema.Types.ObjectId
  participants: Schema.Types.ObjectId[]
  messages: IMessage[]
  group: string
  groupImage: string
  roomId: string
}

const messages = new Schema<IMessage>({
  createdBy: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  content: { type: String, min: 1 },
})

const chatSchema = new Schema<IChat>(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    participants: {
      type: [Schema.Types.ObjectId],
      ref: 'users',
      required: true,
    },
    messages: [messages],
    group: { type: String },
    groupImage: { type: String },
    roomId: { type: String },
  },
  {
    timestamps: true,
    strictQuery: true,
    strict: true,
    toObject: {},
    toJSON: {},
  },
)

const chatModel = mongoose.models.chats || model('chats', chatSchema)

export default chatModel
