import {
  generateAccessToken,
  generateRefreshToken,
} from '../../common/security/jsonWebTokens.js'
import { HydratedDocument } from 'mongoose'
import { IUser } from '../../DB/models/users/user.interface.js'
import { eventEmitter } from '../../common/utils/email/email.event.js'
import mailEnum from '../../common/enum/mail.enum.js'
import { sendEmail } from '../../common/utils/email/sendEmail.js'
import { generateOtp } from '../../common/utils/email/nodeMailer.js'
import userRepo from '../../DB/repo/user.repo.js'
import {
  ErrorConflict,
  ErrorNotFound,
} from '../../common/utils/globalresponse.js'
import redisService from '../../common/services/redis.services.js'
class servicesHelpers {
  private readonly _userModel = new userRepo()
  private readonly _redisServices = new redisService()

  generateTokens(user: HydratedDocument<IUser>): {
    accessToken: string
    refreshToken: string
  } {
    const accessToken: string = generateAccessToken({
      userId: user.id,
      role: user.role!,
    })
    const refreshToken: string = generateRefreshToken({
      userId: user.id,
      role: user.role!,
    })

    return { accessToken, refreshToken }
  }

  fireMailEvent = (email: string, mailEnumSubject: string, data: any) => {
    eventEmitter.emit(mailEnum.sendMail, async () => {
      await sendEmail({
        to: email,
        subject: mailEnumSubject,
        data,
      })
    })
  }

  checkUserExistsAndConfirmed = async (
    email: string,
    confirmed: boolean | null,
  ) => {
    const emailExists: any = await this._userModel.findOne({
      filter: confirmed == true
        ? { 'email.data': email, confirmed: true }
        : { 'email.data': email },
    })
    if (confirmed == null) {
      if (emailExists) return ErrorConflict('email already exists')
    } else if (confirmed == false || confirmed == true) {
      if (!emailExists) return ErrorConflict('email is not exists exists')
    }
    return emailExists
  }

  getUserCache = async (email: string, cacheEnumSubject: string) => {
    const cache = await this._redisServices.getKey({
      key: this._redisServices.cacheKey({
        filter: email,
        subject: cacheEnumSubject,
      }),
    })

    return cache
  }

  deleteUserCache = async (email: string, cacheEnumSubject: string) => {
    await this._redisServices.deleteKey({
      key: this._redisServices.cacheKey({
        filter: email,
        subject: mailEnum.confirmSingUp,
      }),
    })
  }
}

export default new servicesHelpers()
