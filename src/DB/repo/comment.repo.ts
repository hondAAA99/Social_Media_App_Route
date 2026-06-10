import { Model } from 'mongoose'
import commentModel from '../models/comments/comment.model.js'
import repoBase from './repo.base.js'
import { IComment } from '../models/comments/comment.interface.js'

class commentRepo extends repoBase<IComment> {
  constructor(private readonly _commentModel: Model<IComment> = commentModel) {
    super(_commentModel)
  }
}

export default commentRepo
