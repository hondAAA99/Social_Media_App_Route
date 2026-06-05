import { Model } from 'mongoose'
import repoBase from './repo.base.js'
import chatModel, { IChat } from '../models/chat.model.js'

class chatRepo extends repoBase<IChat> {
  constructor(protected readonly _model: Model<IChat> = chatModel) {
    super(_model)
  }
}

export default chatRepo
