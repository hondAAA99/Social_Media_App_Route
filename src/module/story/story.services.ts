import { NextFunction, Response, Request } from 'express'
import s3services from '../../common/services/s3Services.js'
import postRepo from '../../DB/repo/post.repo.js'
import storyRepo from '../../DB/repo/story.repo.js'
import userRepo from '../../DB/repo/user.repo.js'
import {
  ErrorConflict,
  SuccessResponse,
} from '../../common/utils/globalresponse.js'
import { HydratedDocument } from 'mongoose'
import { IUser } from '../../DB/models/user.model.js'

class storyServices {
  private readonly _userModel = new userRepo()
  private readonly _s3services = new s3services()
  private readonly _postModel = new postRepo()
  private readonly _storyModel = new storyRepo()
  constructor() {}

  createStory = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    const { file } = req
    const { text, backGroundColour, excludeUsers, availiabilty } = req.body
    let url

    if (file) {
      url = await this._s3services.uploadFile({
        file: file!,
        path: `users/${user?.email.data}/storiess`,
      })
    }

    if (excludeUsers.length) {
      excludeUsers.map(async (ex: HydratedDocument<IUser>) => {
        ex?.id == user?.id
          ? ErrorConflict('you can not exclude yourself')
          : true

        const findUser = await this._userModel.findById({
          id: ex.id,
        })
        if (!findUser) ErrorConflict('can not find user')

      })
    }

    await this._storyModel.create({
      createdBy: user?.id!,
      url: url!,
      text,
      backGroundColour,
      excludeUsers,
      availiabilty,
      expiresAt: 1000 * 60 * 60 * 24,
    })

    SuccessResponse({ res, data: 'story uploaded' })
  }
}
