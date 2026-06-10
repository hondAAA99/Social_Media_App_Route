import { Model } from 'mongoose'
import repoBase from './repo.base.js'
import chatModel  from '../models/chat/chat.model.js'
import { IChat } from '../models/chat/chat.interface.js'

class chatRepo extends repoBase<IChat> {
  constructor(protected readonly _model: Model<IChat> = chatModel) {
    super(_model)
  }
}

export default chatRepo
