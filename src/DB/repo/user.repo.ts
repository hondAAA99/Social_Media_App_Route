import { Model } from 'mongoose'
import repoBase from './repo.base.js'
import userModel from '../models/users/user.model.js'
import { HydratedDocument } from 'mongoose'
import { IUser } from '../models/users/user.interface.js'

class userRepo extends repoBase<IUser> {
  constructor(protected readonly _model: Model<IUser | any> = userModel) {
    super(_model)
  }
}

export default userRepo
