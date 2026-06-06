import { Schema } from "mongoose"

export interface IMessage {
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
