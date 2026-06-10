import type { Request, Response, NextFunction } from 'express'
import userRepo from '../../DB/repo/user.repo.js'
import {
  ErrorConflict,
  ErrorNotFound,
  ErrorUnAuthorizedRequest,
  SuccessResponse,
} from '../../common/utils/globalresponse.js'
import redisServices from '../../common/services/redis.services.js'
import { GlobalCompare, Globalhash } from '../../common/security/hash.js'
import { HydratedDocument, Schema, Types } from 'mongoose'
import cacheKeyEnum from '../../common/enum/redis.base.enum.js'
import s3Services from '../../common/services/s3Services.js'
import postRepo from '../../DB/repo/post.repo.js'
import { Globalencrypt } from '../../common/security/encrypt.js'
import availabiltyEnum from '../../common/enum/availablity.enum.js'

import fireBaseServices from '../../common/services/fireBase.services.js'
import { sendEmail } from '../../common/utils/email/sendEmail.js'
import mailEnum from '../../common/enum/mail.enum.js'
import storyRepo from '../../DB/repo/story.repo.js'
import {
  handleFriendRequestSchemaDTO,
  lockProfileDTO,
  removeFriendSchemaDTO,
  sendFriendRequestSchemaDTO,
  shareProfileSchemaDTO,
  updateEmailSchemaDTO,
  updatePasswordSchemaDTO,
  updateProfileSchemaDTO,
} from './user.dto.js'
import { IFriendItem, IUser } from '../../DB/models/users/user.interface.js'
import {
  blockUserEnum,
  friendsFlagEnum,
  friendsRequestEnum,
} from '../../common/enum/user.base.enum.js'
import { isUserBlocked } from './services.helpers.js'
import { generateOtp } from '../../common/utils/email/nodeMailer.js'
import servicesHelpers from '../auth/services.helpers.js'
import chatRepo from '../../DB/repo/chat.repo.js'

class userServices {
  private readonly _userModel = new userRepo()
  private readonly _redisServices = new redisServices()
  private readonly _s3services = new s3Services()
  private readonly _postModel = new postRepo()
  private readonly _storyModel = new storyRepo()
  private readonly _fireBase = new fireBaseServices()
  private readonly _chatRepo = new chatRepo()

  constructor() {}

  lockProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    const { flag }: lockProfileDTO = req.query
    if (user?.profileLock && flag == 'lock') {
      return ErrorConflict('the profile is already locked')
    } else if (!user?.profileLock && flag == 'unlock') {
      return ErrorConflict('the profile is already unlocked')
    }
    await this._userModel.findByIdAndUpdate({
      id: user?.id!,
      update: {
        profileLock: flag == 'lock' ? true : false,
      },
    })

    SuccessResponse({ res, data: 'user data updated' })
  }

  ShareProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    console.log(user)

    const { userId }: shareProfileSchemaDTO = req.params
    const isFriend = user?.friends?.data!.find(fr => {
      return fr.friendId.toString() == userId?.toString()
    })

    const sharedUser: HydratedDocument<IUser> | null =
      await this._userModel.findOne({
        filter: {
          id: userId!,
        },
        // projection:
        // 'profileLock userName profilePicture email friends phone age gender',
      })
    isUserBlocked(sharedUser!, user!.id)

    const canShow = (avail: string): boolean => {
      return (avail == availabiltyEnum.friends && isFriend) ||
        avail == availabiltyEnum.public
        ? true
        : false
    }

    const Data = {
      profileLock: sharedUser!.profileLock,
      userName: sharedUser!.userName,
      firstName: sharedUser!.firstName,
      lastName: sharedUser!.lastName,
      profilePicture: sharedUser!.profilePicture,
      email: canShow(sharedUser?.email?.availability!)
        ? sharedUser!.email.data
        : (undefined as any),

      phone: canShow(sharedUser?.phone?.availability!)
        ? sharedUser!.phone!.data
        : (undefined as any),

      age: canShow(sharedUser?.age?.availability!)
        ? sharedUser!.age!.data
        : (undefined as any),

      gender: canShow(sharedUser?.gender?.availability!)
        ? sharedUser!.gender!.data
        : (undefined as any),

      friends: canShow(sharedUser?.friends?.availability!)
        ? sharedUser!.friends.data
        : (undefined as any),
    }

    console.log(sharedUser)

    SuccessResponse({
      res,
      data: Data,
    })
  }

  getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    const {
      profileLock,
      userName,
      profilePicture,
      email,
      friends,
      phone,
      age,
      gender,
    } = req.user!
    const groups = await this._chatRepo.findAll({
      filter: {
        participants: {
          $in: [req?.user!.id],
        },
        group: { $exists: true },
      },
    })

    SuccessResponse({
      res,
      data: {
        profileLock,
        userName,
        profilePicture,
        email,
        friends,
        phone,
        age,
        gender,
        groups,
      },
    })
  }

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, age, gender, phone } =
      req.body as updateProfileSchemaDTO
    const { file } = req
    const { user } = req.body

    await this._userModel.findByIdAndUpdate({
      id: user?.id,
      update: {
        firstName,
        lastName,
        'age.data': age?.data,
        'age.availability': age?.availability,
        'gender.data': gender?.data,
        'gender.availability': gender?.availability,
        'phone.data': Globalencrypt({ plainText: phone?.data! }),
        'phone.availability': phone?.availability,
        profilePicture: file
          ? await this._s3services.uploadFile({
              file: req.file as Express.Multer.File,
              path: `user/${user.email}/profile-photo`,
            })
          : undefined,
      },
    })

    SuccessResponse({ res, data: 'user updated' })
  }

  updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, passwordSchema }: updatePasswordSchemaDTO = req.body
    const { user } = req
    console.log({ plainText: oldPassword, hashText: user!.password })
    if (!GlobalCompare({ plainText: oldPassword, hashText: user!.password }))
      ErrorUnAuthorizedRequest('passwords does not match')
    await this._userModel.findOneAndUpdate({
      filter: { email: user!.email, confirmed: true },
      update: { password: Globalhash({ plainText: passwordSchema.password }) },
    })

    SuccessResponse({ res, data: 'password updated' })
  }

  updateEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    const { email }: updateEmailSchemaDTO = req.body
    const emailExists = await this._userModel.findOne({
      filter: {
        'email.data': email,
      },
    })
    if (emailExists) return ErrorNotFound('email is used by another user')

    await sendEmail({
      to: email!,
      subject: mailEnum.confirmSingUp,
      data: generateOtp(),
    })

    SuccessResponse({ res, data: 'please confirm the email' })
  }

  updateEmailconfirmation = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { user } = req
    const { email, otp } = req.body
    const emailExists = await this._userModel.findOne({
      filter: {
        'email.data': email,
      },
    })
    if (emailExists) return ErrorNotFound('email is used by another user')
    const cached = (await servicesHelpers.getUserCache(
      email,
      cacheKeyEnum.confirmSingUp,
    )) as string
    if (!GlobalCompare({ plainText: otp, hashText: cached }))
      user!.email!.data = email
    await user?.save()

    SuccessResponse({ res, data: 'email updated' })
  }

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    user!.deletedAt = new Date()
    user!.deletedBy = user!._id as any
    await user!.save()

    SuccessResponse({ res, data: 'user deleted' })
  }

  logout = async (req: Request, res: Response, next: NextFunction) => {
    const { flag } = req.query
    const { user } = req
    if (flag == 'all') {
      user!.credentials = new Date(Date.now())
      user!.save()
      await this._redisServices.deleteKey({
        key: this._redisServices.cacheKey({
          filter: user!.email.data!,
          subject: cacheKeyEnum.revokeToken,
        }),
      })
      SuccessResponse({ res, data: 'logout succeded from all devices' })
    }
    await this._redisServices.setKey({
      key: this._redisServices.cacheKey({
        filter: req.token as string,
        subject: cacheKeyEnum.revokeToken,
      }),
      value: user!.email,
      ttl: Date.now() - req.tokenDecoded.iat! * 1000,
    })
    SuccessResponse({ res, data: 'logout succeded' })
  }

  sendFriendRequest = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { user } = req
    const { requestedUserId }: sendFriendRequestSchemaDTO = req.params

    const requestedUser = await this._userModel.findById({
      id: requestedUserId,
    })
    isUserBlocked(requestedUser!, user!.id)

    if (!requestedUser) return ErrorNotFound('requested user not found')

    requestedUser?.friends.data!.push({
      friendId: user?.id!,
      flag: friendsFlagEnum.requested,
    })

    await requestedUser?.save()

    const cachedFCM = await this._redisServices.getSet({
      filter: user?.email.data!,
      subject: cacheKeyEnum.fcm,
    })
    if (cachedFCM) {
      this._fireBase.sendNotifications({
        tokens: cachedFCM,
        data: {
          title: 'friend request',
          body: `${user?.userName} sent friend request`,
        },
      })
    }

    SuccessResponse({ res, data: 'request has been sent' })
  }

  handleFriendRequest = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { user } = req
    const { requestingUserId, flag }: handleFriendRequestSchemaDTO = req.params
    const requestingUser = await this._userModel.findById({
      id: requestingUserId,
    })

    if (!requestingUserId) return ErrorNotFound('requested user not found')

    if (
      flag == friendsRequestEnum.accept ||
      flag == friendsRequestEnum.reject
    ) {
      user?.friends.data!.map((f: IFriendItem) => {
        return f.friendId == requestingUserId
          ? flag == friendsRequestEnum.accept
            ? (f.flag = friendsFlagEnum.reject)
            : user?.friends.data!.slice(
                user?.friends.data!.findIndex((fr: IFriendItem) => {
                  return fr.friendId == requestingUserId
                }),
                1,
              )
          : null
      })
    }

    if (flag == friendsRequestEnum.accept) {
      const cachedFCMS = await this._redisServices.getSet({
        filter: requestingUser!.email?.data!,
        subject: cacheKeyEnum.fcm,
      })
      if (cachedFCMS) {
        this._fireBase.sendNotifications({
          tokens: cachedFCMS,
          data: {
            title: `friend request update`,
            body: `${user?.userName} accept your frined request`,
          },
        })
      }
    }

    SuccessResponse({ res, data: 'done' })
  }

  removeFriend = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    const { removedFriendId } = req.params as removeFriendSchemaDTO
    const removedUser = await this._userModel.findById({ id: removedFriendId })

    if (!removedUser) ErrorNotFound('user not Found')

    user?.friends.data!.map((f: IFriendItem) => {
      if (f.friendId == removedFriendId) {
        user?.friends.data!.slice(
          user?.friends.data!.findIndex((fr: IFriendItem) => {
            return fr.friendId == removedFriendId
          }),
          1,
        )
      }
    })
    await user?.save()

    removedUser?.friends.data!.map((f: IFriendItem) => {
      if (f.friendId == user?.id) {
        removedUser?.friends.data!.slice(
          removedUser?.friends.data!.findIndex((fr: IFriendItem) => {
            return fr.friendId == user?.id
          }),
          1,
        )
      }
    })
    await removedUser?.save()

    SuccessResponse({ res, data: 'user has been removed' })
  }

  blockHandling = async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query
    const { user } = req

    const blockedUser = await this._userModel.findById({
      id: query.blockedUserId,
    })
    if (!blockedUser) return ErrorNotFound('user not found')

    if (
      query.flag == blockUserEnum.block &&
      !user?.blockedUsers.map((b: Schema.Types.ObjectId) => {
        return query.blockedUserId
      })
    ) {
      user?.blockedUsers.push(
        query.blockedUserId as unknown as Schema.Types.ObjectId,
      )
    } else if (
      query.flag == blockUserEnum.unBlock &&
      user?.blockedUsers.map((b: Schema.Types.ObjectId) => {
        return query.blockedUserId
      })
    ) {
      user?.blockedUsers.slice(
        user?.blockedUsers.findIndex((b: Schema.Types.ObjectId) => {
          return query.blockedUserId
        }),
        1,
      )
    }

    SuccessResponse({ res, data: 'operation done' })
  }

  freezeProfile = () => {}
  restartProfile = () => {}
}

export default new userServices()
