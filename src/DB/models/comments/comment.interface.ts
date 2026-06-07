import { Schema } from 'mongoose'
import { IReacts } from '../posts/post.interface.js'

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
  deletedAt : Date;
  deletedBy : Schema.Types.ObjectId;
}
