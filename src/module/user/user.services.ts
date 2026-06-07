import type { Request, Response, NextFunction } from 'express'
import userRepo from '../../DB/repo/user.repo.js'
import {
  ErrorConflict,
  Errorforbidden,
  ErrorNotFound,
  ErrorUnAuthorizedRequest,
  SuccessResponse,
} from '../../common/utils/globalresponse.js'
import redisServices from '../../common/services/redis.services.js'
import { GlobalCompare, Globalhash } from '../../common/security/hash.js'
import { HydratedDocument, Schema } from 'mongoose'
import cacheKeyEnum from '../../common/enum/redis.base.enum.js'
import s3Services from '../../common/services/s3Services.js'
import postRepo from '../../DB/repo/post.repo.js'
import { Globaldecrypt, Globalencrypt } from '../../common/security/encrypt.js'
import availabiltyEnum from '../../common/enum/availablity.enum.js'

import fireBaseServices from '../../common/services/fireBase.services.js'
import { sendEmail } from '../../common/utils/email/sendEmail.js'
import mailEnum from '../../common/enum/mail.enum.js'
import storyRepo from '../../DB/repo/story.repo.js'
import {
  blockUserSchemaDTO,
  handleFriendRequestSchemaDTO,
  lockProfileDTO,
  removeFriendSchemaDTO,
  sendFriendRequestSchemaDTO,
  shareProfileSchemaDTO,
  updateEmailConfirmationSchemaDTO,
  updateEmailSchemaDTO,
  updatePasswordSchemaDTO,
  updateProfileSchemaDTO,
} from './user.dto.js'
import { IUser } from '../../DB/models/users/user.interface.js'
import {
  blockUserEnum,
  friendsFlagEnum,
  friendsRequestEnum,
} from '../../common/enum/user.base.enum.js'

class userServices {
  private readonly _userModel = new userRepo()
  private readonly _redisServices = new redisServices()
  private readonly _s3services = new s3Services()
  private readonly _postModel = new postRepo()
  private readonly _storyModel = new storyRepo()
  private readonly _fireBase = new fireBaseServices()

  constructor() {}

  lockProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    const { flag } = req.query as lockProfileDTO
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
    const { userId } = req.params as shareProfileSchemaDTO
    const sharedUser = await this._userModel.findById({ id: userId })

    if (
      sharedUser?.profileLock &&
      !sharedUser.friends.data.some(f => f.friendId == user?.id)
    ) {
      SuccessResponse({
        res,
        data: {
          userName: sharedUser?.userName,
          profilePicture: sharedUser?.profilePicture,
          email:
            sharedUser?.email.availability == availabiltyEnum.public
              ? sharedUser?.email.data
              : undefined,
          friends:
            sharedUser?.friends.availability == availabiltyEnum.public
              ? sharedUser?.friends.data
              : undefined,
          phone:
            sharedUser?.phone?.availability == availabiltyEnum.public
              ? sharedUser?.phone.data
              : undefined,
          age:
            sharedUser?.age?.availability == availabiltyEnum.public
              ? sharedUser?.age.data
              : undefined,
          gender:
            sharedUser?.gender?.availability == availabiltyEnum.public
              ? sharedUser?.gender.data
              : undefined,
          createdAt: sharedUser?.createdAt,
        },
      })
    }
    const sharedPosts = await this._postModel.findAll({
      filter: {
        createdBy: sharedUser?.id!,
        availablity: {
          $or: [...postAvailbilty(req)],
        },
      } as any,
      options: {
        populate: [
          {
            path: 'comments',
            match: {
              commentId: { $exists: false },
            },
            populate: {
              path: 'replies',
            },
          },
        ],
      },
    })

    SuccessResponse({ res, data: { sharedUser, sharedPosts } })
  }

  getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    const posts = await this._postModel.findAll({
      filter: {
        createdBy: user!.id,
      },
      options: {
        populate: [
          {
            path: 'comments',
            match: {
              commentId: { $exists: false },
            },
            populate: {
              path: 'replies',
            },
          },
        ],
      },
    })
    SuccessResponse({ res, data: { user, posts } })
  }

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, age, gender, phone, friends } =
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
        'friends.availability': friends?.availability,
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
    const { oldPassword, newPassword } = req.body as updatePasswordSchemaDTO
    const user: HydratedDocument<IUser> = req.user
    const hashOldPassword = user.password
    if (!GlobalCompare({ plainText: oldPassword, hashText: hashOldPassword }))
      ErrorUnAuthorizedRequest('passwords does not match')

    await this._userModel.findOneAndUpdate({
      filter: { email: user.email, confirmed: true },
      update: { password: Globalhash({ plainText: newPassword }) },
    })

    SuccessResponse({ res, data: 'password updated' })
  }

  updateEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    const { email } = req.body as updateEmailSchemaDTO
    const emailExists = await this._userModel.findOne({
      filter: {
        id: user?.id,
        'email.data': email,
      },
    })
    if (emailExists) return ErrorNotFound('email is used by another user')

    await sendEmail({
      to: email,
      subject: mailEnum.consrimSingUp,
      data: Math.floor(Math.random() * 10000),
    })

    SuccessResponse({ res, data: 'please confirm the email' })
  }

  updateEmailConfirmation = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { user } = req
    const { newEmail, otp } = req.body as updateEmailConfirmationSchemaDTO

    const cachedOtp = (await this._redisServices.getKey({
      key: this._redisServices.cacheKey({
        filter: newEmail,
        subject: cacheKeyEnum.emailAttempts,
      }),
    })) as string

    if (!GlobalCompare({ plainText: otp, hashText: cachedOtp })) {
      return Errorforbidden('worng otp')
    }

    user!.email.data = newEmail
    await user?.save()

    await this._redisServices.deleteKey({
      key: this._redisServices.cacheKey({
        filter: newEmail,
        subject: cacheKeyEnum.emailAttempts,
      }),
    })

    SuccessResponse({ res, data: 'email updated' })
  }

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    user.deletedAt = new Date()
    user.deletedBy = user?.Id
    await user.save()

    SuccessResponse({ res, data: 'user deleted' })
  }

  logout = async (req: Request, res: Response, next: NextFunction) => {
    const { flag } = req.query
    const user: HydratedDocument<IUser> = req.user as HydratedDocument<IUser>
    if (flag == 'all') {
      user.creadnatials = new Date(Date.now())
      user.save()
      // await this._redisServices.deleteKey({
      //   key : this._redisServices.cacheKey({filter : user.email , subject : cacheKeyEnum.revokeToken})
      // })
      // SuccessResponse({res ,data : "logout succeded from all devices"})
    }
    await this._redisServices.setKey({
      key: this._redisServices.cacheKey({
        filter: req.token as string,
        subject: cacheKeyEnum.revokeToken,
      }),
      value: user.email,
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
    const { requestedUserId } = req.params as sendFriendRequestSchemaDTO

    const requestedUser = await this._userModel.findById({
      id: requestedUserId,
    })

    if (!requestedUser) return ErrorNotFound('requested user not found')

    requestedUser?.friends.data.push({
      friendId: user?.id!,
      flag: friendsFlagEnum.requested,
    })

    await requestedUser?.save()

    const cachedFCM = await this._redisServices.getSet({
      filter: user?.email.data!,
      subject: cacheKeyEnum.fcm,
    })
    this._fireBase.sendNotifications({
      tokens: cachedFCM,
      data: {
        title: 'friend request',
        body: `${user?.userName} sent friend request`,
      },
    })
  }

  handleFriendRequest = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { user } = req
    const { requestingUserId, flag } =
      req.params as handleFriendRequestSchemaDTO
    const requestingUser = await this._userModel.findById({
      id: requestingUserId,
    })

    if (!requestingUserId) return ErrorNotFound('requested user not found')

    if (
      flag == friendsRequestEnum.accept ||
      flag == friendsRequestEnum.reject
    ) {
      user?.friends.data.map((f: HydratedDocument<IFriend>) => {
        if (f.friendId == requestingUserId) {
          flag == friendsRequestEnum.accept
            ? (f.flag = friendsFlagEnum.friend)
            : user?.friends.data.slice(
                user?.friends.data.findIndex(fr => {
                  return fr.friendId == requestingUserId
                }),
                1,
              )
        }
      })
    } else {
      return ErrorConflict('please check request flag')
    }

    const cachedFCMS = await this._redisServices.getSet({
      filter: requestingUserId.email?.data!,
      subject: cacheKeyEnum.fcm,
    })
    this._fireBase.sendNotifications({
      tokens: cachedFCMS,
      data: {
        title: `friend request update`,
        body: `${user?.userName} accept your frined request`,
      },
    })
  }

  removeFriend = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req
    const { removedFriendId } = req.params as removeFriendSchemaDTO
    const removedUser = await this._userModel.findById({ id: removedFriendId })

    if (!removedUser) ErrorNotFound('user not Found')

    user?.friends.data.map(f => {
      if (f.friendId == removedFriendId) {
        user?.friends.data.slice(
          user?.friends.data.findIndex(fr => {
            return fr.friendId == removedFriendId
          }),
          1,
        )
      }
    })

    await user?.save()

    SuccessResponse({ res, data: 'user has been removed' })
  }

  blockUser = async (req: Request, res: Response, next: NextFunction) => {
    const { blockedUserId, flag } = req.params as blockUserSchemaDTO
    const { user } = req

    const blockedUser = await this._userModel.findById({ id: blockedUserId })
    if (!blockedUser) return ErrorNotFound('user not found')

    if (
      flag == blockUserEnum.block &&
      !user?.blockedUsers.map(b => {
        return b == blockedUserId
      })
    ) {
      user?.blockedUsers.push(blockedUserId)
    } else if (
      flag == blockUserEnum.unBlock &&
      user?.blockedUsers.map(b => {
        return b == blockedUserId
      })
    ) {
      user?.blockedUsers.slice(
        user?.blockedUsers.findIndex(b => {
          return b == blockedUserId
        }),
        1,
      )
    }

    SuccessResponse({ res, data: 'operation done' })
  }
}

export default new userServices()
