import { Schema } from 'mongoose'

export interface IStoryView {
  userId: Schema.Types.ObjectId
  viewDate: Date
}

export interface IStory {
  id: Schema.Types.ObjectId
  createdBy: Schema.Types.ObjectId
  url: string
  text: string
  backGroundColor: string
  createdAt: Date
  updatedAt: Date
  expiresAt: number
  excludeUsers: Schema.Types.ObjectId[]
  views: IStoryView[]
  availability: string
}