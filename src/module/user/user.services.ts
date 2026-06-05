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
import { IUser } from '../../DB/models/user.model.js'
import cacheKeyEnum from '../../common/enum/cacheKey.enum.js'
import s3Services from '../../common/services/s3Services.js'
import postRepo from '../../DB/repo/post.repo.js'
import { Globaldecrypt, Globalencrypt } from '../../common/security/encrypt.js'
import { postAvailbilty } from '../../common/utils/postUtils.js'
import availabiltyEnum from '../../common/enum/availablity.enum.js'
import {
  friendsFlagEnum,
  friendsRequestEnum,
} from '../../common/enum/friendsFlag.enum.js'
import fireBaseServices from '../../common/services/fireBase.services.js'
import { sendEmail } from '../../common/utils/email/sendEmail.js'
import mailEnum from '../../common/enum/mail.enum.js'
import blockUserEnum from '../../common/enum/blockUser.enum.js'
import storyRepo from '../../DB/repo/story.repo.js'

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
    const { flag } = req.query
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
    const { userId } = req.params
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
            sharedUser?.email.availibilty == availabiltyEnum.public
              ? sharedUser?.email.data
              : undefined,
          friends:
            sharedUser?.friends.availibilty == availabiltyEnum.public
              ? sharedUser?.friends.data
              : undefined,
          phone:
            sharedUser?.phone?.availibilty == availabiltyEnum.public
              ? sharedUser?.phone.data
              : undefined,
          age:
            sharedUser?.age?.availibilty == availabiltyEnum.public
              ? sharedUser?.age.data
              : undefined,
          gender:
            sharedUser?.gender?.availibilty == availabiltyEnum.public
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
    const { firstName, lastName, age, gender, phone, friends } = req.body
    const { file } = req
    const { user } = req.body
    await this._userModel.findByIdAndUpdate({
      id: user?.id,
      update: {
        firstName,
        lastName,
        'age.data': age?.data,
        'age.availibilty': age?.availibilty,
        'gender.data': gender?.data,
        'gender.availibilty': gender?.availibilty,
        'phone.data': Globalencrypt({ plainText: phone?.data! }),
        'phone.availibilty': phone?.availibilty,
        'friends.availibilty': friends.availibilty,
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
    const { oldPassword, newPassword } = req.body
    const user: HydratedDocument<IUser> = req.user as HydratedDocument<IUser>
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
    const { email } = req.body
    const emailExists = await this._userModel.findOne({
      filter: {
        'email.data': email,
      },
    })
    if (emailExists) return ErrorNotFound('email is used by anthor user')

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
    const { newEmail, otp } = req.body

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
    await this._userModel.findByIdAndDelete({
      id: user!.id,
    })

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
    const { requestedUserId } = req.params

    const requestedUser = await this._userModel.findById({
      id: requestedUserId,
    })

    if (!requestedUser) return ErrorNotFound('requested user not found')

    requestedUser?.friends.data.push({
      friendId: user?.id!,
      flag: friendsFlagEnum.requestd,
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
    const { requestingUserId, flag } = req.params
    const requestingUser = await this._userModel.findById({
      id: requestingUserId,
    })

    if (!requestingUserId) return ErrorNotFound('requested user not found')

    if (
      flag == friendsRequestEnum.accept ||
      flag == friendsRequestEnum.reject
    ) {
      user?.friends.data.map(f => {
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
    const { removedFriendId } = req.params
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
    const { blockedUserId, flag } = req.params
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
