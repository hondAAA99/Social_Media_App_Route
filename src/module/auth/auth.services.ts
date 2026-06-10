import type { Request, Response, NextFunction } from 'express'
import {
  ErrorConflict,
  ErrorInternalServerError,
  ErrorUnAuthorizedRequest,
  SuccessResponse,
} from '../../common/utils/globalresponse.js'
import { _QueryFilter, HydratedDocument } from 'mongoose'
import userRepo from '../../DB/repo/user.repo.js'
import { GlobalCompare, Globalhash } from '../../common/security/hash.js'
import { Globalencrypt } from '../../common/security/encrypt.js'
import mailEnum from '../../common/enum/mail.enum.js'
import redisServices from '../../common/services/redis.services.js'
import {
  O2AUTH_CLIENT_ID,
  SECRET_ADMIN_REFRESH_TOKEN,
  SECRET_USER_REFRESH_TOKEN,
  TOKEN_ADMIN_PREFIX,
} from '../../config/config.services.js'
import { LoginTicket, OAuth2Client, TokenPayload } from 'google-auth-library'
import fireBaseServices from '../../common/services/fireBase.services.js'
import {
  confirmEmailDTOBody,
  confirmEmailDTOParams,
  lobInDTO,
  resendOtpDTOBody,
  resendOtpDTOParams,
  resetPasswordDTO,
  sendOtpDTO,
  signUpDTO,
} from './auth.dto.js'
import {
  generateAccessToken,
  TokenVerify,
} from '../../common/security/jsonWebTokens.js'
import { IUser } from '../../DB/models/users/user.interface.js'
import cacheKeyEnum from '../../common/enum/redis.base.enum.js'
import servicesHelpers from './services.helpers.js'
import { generateOtp } from '../../common/utils/email/nodeMailer.js'
import {
  confirmEmailFlagEnum,
  providerEnum,
  roleEnum,
} from '../../common/enum/user.base.enum.js'
import confirmMailFlagEnum from '../../common/enum/confirmMailFlag.enum.js'
class auth {
  private readonly _userModel = new userRepo()
  private readonly _fireBase = new fireBaseServices()
  private readonly _redisServices = new redisServices()

  constructor() {}

  signUp = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const {
      userName,
      email,
      passwordSchema,
      phone,
      gender,
      BirthDate,
    }: signUpDTO = req.body

    const user = await servicesHelpers.checkUserExistsAndConfirmed(email, null)
    await this._userModel
      .create({
        userName,
        provider: providerEnum.system,
        email: { data: email },
        password: Globalhash({ plainText: passwordSchema.password }),
        age: BirthDate ? { data: BirthDate } : undefined,
        phone: phone
          ? { data: Globalencrypt({ plainText: phone }) }
          : undefined,
        gender: gender ? { data: gender } : undefined,
      } as Partial<IUser>)
      .catch(err => {
        ErrorInternalServerError(
          `error in creating user or failed to send email *${err}`,
        )
      })

    const emailData = generateOtp()
    servicesHelpers.fireMailEvent(email, mailEnum.confirmSingUp, emailData)
    SuccessResponse({ res, data: 'please confirm your email' })
  }

  confirmMail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { email, otp }: confirmEmailDTOBody = req.body
    const { flag } = req.query
    await servicesHelpers.checkUserExistsAndConfirmed(email, false)

    const CacheKey =
      flag == confirmMailFlagEnum.confirmSingUp
        ? cacheKeyEnum.confirmSingUp
        : cacheKeyEnum.twoStepVerification

    const CachedOtp = await servicesHelpers
      .getUserCache(email, CacheKey)
      .then(value => {
        if (
          !GlobalCompare({
            plainText: otp,
            hashText: value as string,
          })
        )
          return ErrorUnAuthorizedRequest('wrong otp code')
      })

    await Promise.all([
      servicesHelpers.deleteUserCache(email, CacheKey),
      this._userModel.findOneAndUpdate({
        filter: { 'email.data': email },
        update:
          CacheKey == cacheKeyEnum.confirmSingUp
            ? { confirmed: true }
            : { twoStepVerification: true },
      }),
    ]).catch(err => {
      return ErrorInternalServerError(
        `failed to confirm email and enable two step verification *${err}`,
      )
    })

    SuccessResponse({ res, data: 'email confirmed' })
  }

  logIn = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { email, password, fcm }: lobInDTO = req.body

    const user: HydratedDocument<IUser> =
      await servicesHelpers.checkUserExistsAndConfirmed(email, true)

    if (
      !GlobalCompare({
        plainText: password,
        hashText: user!.password!,
      })
    ) {
      return ErrorUnAuthorizedRequest('wrong password')
    }

    let recordedFcms: string[] = (await this._redisServices.getSet({
      filter: email,
      subject: cacheKeyEnum.fcm,
    })) as string[]

    if (recordedFcms) {
      await this._redisServices.addSet(
        {
          filter: email,
          subject: cacheKeyEnum.fcm,
        },
        fcm,
      )
    } else if (!(recordedFcms as any).includes(fcm)) {
      ;(recordedFcms as any).push(fcm)
      await this._redisServices.addSet(
        {
          filter: email,
          subject: cacheKeyEnum.fcm,
        },
        recordedFcms,
      )
    }

    //     // await this._fireBase.sendNotifications({
    //     //   tokens: value,
    //     //   data: {
    //     //     title: 'login alert',
    //     //     body: `new login at ${new Date(Date.now())}`,
    //     //   },
    //     // })
    //   } catch (err) {
    //     return ErrorInternalServerError('failed to send notification')
    //   }


    if (user?.twoStepVerification == true) {
      const emailData = generateOtp()

      servicesHelpers.fireMailEvent(email, mailEnum.confirmLoginIn, emailData)
      SuccessResponse({
        res,
        data: 'please confirm your login',
      })
    }
    SuccessResponse({
      res,
      data: servicesHelpers.generateTokens(user! as any),
    })
  }

  confirmLogin = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { email, otp }: confirmEmailDTOBody = req.body
    const user = await servicesHelpers.checkUserExistsAndConfirmed(email, true)

    await servicesHelpers
      .getUserCache(email, cacheKeyEnum.confirmLoginIn)
      .then(value => {
        if (!GlobalCompare({ plainText: otp, hashText: value as string }))
          return ErrorUnAuthorizedRequest('wrong otp code')
      })
      .then(async () => {
        await servicesHelpers.deleteUserCache(
          email,
          cacheKeyEnum.confirmLoginIn,
        )
      })

    SuccessResponse({
      res,
      data: servicesHelpers.generateTokens(user!),
    })
  }

  signUpAndLoginWithGmail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { idToken } = req.body
    const Client = new OAuth2Client(O2AUTH_CLIENT_ID)
    const verifyIdToken: Promise<LoginTicket> = Client.verifyIdToken({
      idToken,
      audience: O2AUTH_CLIENT_ID,
    })
    const payload: TokenPayload | undefined = (await verifyIdToken).getPayload()

    if (!payload) ErrorInternalServerError('invalid token id')
    const { name, email, email_verified, picture }: any = payload

    let emailExists: any = servicesHelpers.checkUserExistsAndConfirmed(
      email,
      true,
    )
    if (!emailExists) {
      emailExists = await this._userModel.create({
        userName: name,
        email: { data: email },
        provider: providerEnum.google,
        confirmed: email_verified,
        profilePicture: picture,
      } as Partial<IUser>)
    }
    if (emailExists?.provider == providerEnum.system)
      ErrorConflict('please login throw system')

    const { accessToken, refreshToken } =
      servicesHelpers.generateTokens(emailExists)
    SuccessResponse({ res, data: { accessToken, refreshToken } })
  }

  reSendOtp = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { email }: resendOtpDTOBody = req.body
    const { flag } = req.query as { flag: string }

    await servicesHelpers.checkUserExistsAndConfirmed(email, false)
    const emailData = generateOtp()

    const CacheKey = () => {
      switch (flag) {
        case confirmMailFlagEnum.confirmSingUp:
          return cacheKeyEnum.confirmSingUp
        case confirmMailFlagEnum.confirmLoginIn:
          return cacheKeyEnum.confirmLoginIn
        case confirmMailFlagEnum.forgetPassword:
          return cacheKeyEnum.forgetPassword
        case confirmMailFlagEnum.twoStepVerification:
          return cacheKeyEnum.twoStepVerification
        default:
      }
    }
    servicesHelpers.fireMailEvent(email, CacheKey()!, emailData)
    SuccessResponse({ res, data: 'otp send please confirm your mail' })
  }

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email, passwordSchema, otp }: resetPasswordDTO = req.body
    const userEmailExists: HydratedDocument<IUser> | null =
      await servicesHelpers.checkUserExistsAndConfirmed(email, true)
    const CachedOtp = (await servicesHelpers.getUserCache(
      email,
      cacheKeyEnum.forgetPassword,
    )) as string
    if (!GlobalCompare({ plainText: otp, hashText: CachedOtp })) {
      ErrorUnAuthorizedRequest('wrong otp')
    }
    servicesHelpers.deleteUserCache(email, cacheKeyEnum.forgetPassword)
    await this._userModel.findOneAndUpdate({
      filter: { 'email.data': email, confirmed: true },
      update: {
        password: Globalhash({ plainText: passwordSchema.password }),
      },
    })
    SuccessResponse({ res, data: 'password updated' })
  }

  generateAccessToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { authorization } = req.headers
    const [prefix, token] = authorization!.split(' ')

    let secret =
      prefix == TOKEN_ADMIN_PREFIX
        ? SECRET_ADMIN_REFRESH_TOKEN
        : SECRET_USER_REFRESH_TOKEN

    const verifyToken = TokenVerify({
      token: token!,
      secret,
    })

    SuccessResponse({
      res,
      data: {
        accessToken: generateAccessToken({
          userId: verifyToken.userId,
          role: verifyToken.role,
        }),
      },
    })
  }
}

export default new auth()
