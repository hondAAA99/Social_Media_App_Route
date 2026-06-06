import { Schema } from "mongoose"
import { IChat, IMessage } from "./chat.interface.js"

const messages = new Schema<IMessage>({
  createdBy: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  content: { type: String, min: 1 },
})

export const chatSchema = new Schema<IChat>(
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
