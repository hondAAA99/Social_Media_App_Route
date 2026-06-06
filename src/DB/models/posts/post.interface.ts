import { Schema } from 'mongoose'

export interface IReactCount {
  total: number
  like: number
  love: number
  sad: number
  angry: number
  care: number
  wow: number
}

export interface IReactedUser {
  userId: Schema.Types.ObjectId
  react: string
}

export interface IReacts {
  reactAviliablity: string
  reactsCount: IReactCount
  reactedUsers: IReactedUser[]
}

export interface IPost {
  id: Schema.Types.ObjectId
  deletedBy: Schema.Types.ObjectId
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
