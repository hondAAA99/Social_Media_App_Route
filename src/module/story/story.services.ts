import { NextFunction, Response, Request } from 'express'
import s3services from '../../common/services/s3Services.js'
import postRepo from '../../DB/repo/post.repo.js'
import storyRepo from '../../DB/repo/story.repo.js'
import userRepo from '../../DB/repo/user.repo.js'
import {
  ErrorConflict,
  ErrorNotFound,
  ErrorUnAuthorizedRequest,
  SuccessResponse,
} from '../../common/utils/globalresponse.js'
import { HydratedDocument, ObjectId } from 'mongoose'
import { IUser } from '../../DB/models/users/user.interface.js'
import { friendsFlagEnum } from '../../common/enum/user.base.enum.js'
import { IStory } from '../../DB/models/stories/story.model.js'
import redisService from '../../common/services/redis.services.js'
import cacheKeyEnum from '../../common/enum/redis.base.enum.js'

class storyServices {
  private readonly _userModel = new userRepo()
  private readonly _s3services = new s3services()
  private readonly _postModel = new postRepo()
  private readonly _storyModel = new storyRepo()
  private readonly _redisServices = new redisService()
  constructor() {}

  createStory = async (req: Request, res: Response, next: NextFunction) => {
    const { user, files } = req
    const { text, backGroundColor, excludeUsers, availiabilty } = req.body
    let url

    if (files) {
      url = await this._s3services.uploadFiles({
        files: files as Express.Multer.File[],
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

    await Promise.all([
      this._storyModel.create({
        createdBy: user?.id!,
        url: url!,
        text,
        backGroundColor,
        excludeUsers,
        availability: availiabilty,
        expiresAt: 1000 * 60 * 60 * 24,
      }),
      user?.friends.data.forEach(async fr => {
        await this._redisServices.deleteKey({
          key: this._redisServices.cacheKey({
            filter: fr?.friendId!,
            subject: cacheKeyEnum.story,
          }),
        })
      }),
    ])

    const cachedKeys = SuccessResponse({ res, data: 'story uploaded' })
  }

  getFeed = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    const cachedStories = await this._redisServices.getKey({
      key: this._redisServices.cacheKey({
        filter: user?.email.data!,
        subject: cacheKeyEnum.story,
      }),
    })

    if (cachedStories) {
      SuccessResponse({ res, data: cachedStories })
    }

    const userAllFriends = user?.friends.data
    const userAcceptedFriends = userAllFriends?.map(fr => {
      return fr.flag == friendsFlagEnum.friend ? fr.friendId : null
    })
    if (!userAcceptedFriends) {
      SuccessResponse({ res, data: 'follow to see more' })
    }

    const stories = (await this._storyModel.findAll({
      filter: {
        createdBy: { $in: userAcceptedFriends },
        excludeUsers: { $nin: [user?.id] },
      },
      options: {
        sort: { createdAt: -1 },
        populate: [
          {
            path: 'createdBy',
            select: 'firstName lastName email',
          },
        ],
      },
    })) as HydratedDocument<IStory>[]

    // 1 1 1 1 1 2  1 23 11 35 43 57 5 8
    // groupStoriesByUser = {
    // userId : -----,
    // stories : story[]
    // }[]
    const groupStoriesByUser = stories.map(story => {
      let userStories = {
        createdBy: story.createdBy,
        stories,
      }
      stories.forEach(story => {
        story.createdBy.toString() == userStories.createdBy.toString()
          ? userStories.stories.push(story)
          : null
      })
    })

    await this._redisServices.setKey({
      key: this._redisServices.cacheKey({
        filter: user?.id!,
        subject: cacheKeyEnum.story,
      }),
      value: groupStoriesByUser,
      ttl: 60 * 15,
    })

    SuccessResponse({ res, data: groupStoriesByUser })
  }

  viewStory = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    const { storyId } = req.params
    const story = await this._storyModel.findById({ id: storyId })
    story?.views.push({
      userId: user?.id!,
      viewDate: new Date(),
    })
    story?.save()
    SuccessResponse({ res, data: 'story viewed' })
  }

  getViewers = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    const { storyId } = req.params
    const story = await this._storyModel.findById({
      id: storyId,
      populate: { path: 'views.userId', select: 'firstName lastName email' },
    })
    if (!story) {
      return ErrorNotFound('story not found')
    }
    if (story.createdBy.toString() !== user?.id.toString()) {
      return ErrorUnAuthorizedRequest('you are not allowed to see viewers')
    }
    SuccessResponse({
      res,
      data: { viewers: story?.views, viewCount: story?.views.length },
    })
  }

  deleteStory = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    const { storyId } = req.params
    const story = await this._storyModel.findById({ id: storyId })
    if (!story) {
      return ErrorNotFound('story not found')
    }
    if (story.createdBy.toString() !== user?.id.toString()) {
      return ErrorUnAuthorizedRequest(
        'you are not allowed to delete this story',
      )
    }
    await this._storyModel.deleteOne({ filter: { id: storyId } })
    await this._s3services.deleteFile({ Key: story.url })
    await this._redisServices.deleteKey({
      key: this._redisServices.cacheKey({
        filter: user?.id!,
        subject: cacheKeyEnum.story,
      }),
    })
    SuccessResponse({ res, data: 'story deleted' })
  }
}

export default new storyServices()
