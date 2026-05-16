import type { Request, Response, NextFunction } from "express";
import { IUser } from "../../DB/models/user.model.js";

import {
  ErrorConflict,
  Errorforbidden,
  ErrorInteralServerError,
  ErrorUnAuthorizedRequest,
  SuccessResponse,
} from "../../common/utils/globalresponse.js";
import { _QueryFilter, HydratedDocument } from "mongoose";
import userRepo from "../../DB/repo/user.repo.js";
import { GlobalCompare, Globalhash } from "../../common/security/hash.js";
import { Globaldecrypt, Globalencrypt } from "../../common/security/encrypt.js";
import { sendEmail } from "../../common/utils/email/sendEmail.js";
import mailEnum from "../../common/enum/mail.enum.js";
import { genrateOtp } from "../../common/utils/email/nodeMailer.js";
import { generateTokens } from "./services.helpers.js";
import redisServices from "../../common/services/redis.services.js";
import { O2AUTH_CLIENT_ID } from "../../config/config.services.js";
import { LoginTicket, OAuth2Client, TokenPayload } from "google-auth-library";
import providerEnum from "../../common/enum/provider.enum.js";
import fireBaseServices from "../../common/services/fireBase.services.js";
import cacheKeyEnum from "../../common/enum/cacheKey.enum.js";
import {
  confirmEmailDTO,
  forgetPasswordDTO,
  lobInDTO,
  resendOtpDTO,
  resetPasswordDTO,
  signUpDTO,
} from "./auth.dto.js";
class auth {
  private readonly _userModel = new userRepo();
  private readonly _fireBase = new fireBaseServices();
  private readonly _redisServices = new redisServices();

  constructor() {}

  signUp = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { userName, email, password, phone, gender, DateOfBirth }: signUpDTO =
      req.body;
    const emailExists: HydratedDocument<IUser> | null =
      await this._userModel.userEmailExists({ email });
    if (emailExists) {
      ErrorConflict("email already exists");
    }

    const user: HydratedDocument<IUser> = await this._userModel.create({
      userName.data,
      email,
      password: Globalhash({ plainText: password }),
      age: DateOfBirth,
      phone: phone ? Globalencrypt({ plainText: phone }) : null,
      gender,
    } as Partial<IUser>);

    await sendEmail({
      to: email,
      subject: mailEnum.consrimSingUp,
      data: genrateOtp(),
    });

    SuccessResponse({ res, data: "please confirm your email" });
  };

  logIn = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { email, password, fcm }: lobInDTO = req.body;
    const emailExists: HydratedDocument<IUser> | null =
      await this._userModel.userEmailExists({ email, confirmed: true });
    if (!emailExists) {
      ErrorConflict("email doesn't exists");
    }
    if (!emailExists) ErrorConflict("email does not exists or confirmed");
    if (
      !GlobalCompare({ plainText: password, hashText: emailExists!.password })
    ) {
      Errorforbidden("wrong password");
    }

    let recorderedFcms = await this._redisServices.getSet({
      filter: email,
      subject: cacheKeyEnum.fcm,
    });

    if (!recorderedFcms) {
      await this._redisServices.addSet(
        {
          filter: email,
          subject: cacheKeyEnum.fcm,
        },
        fcm,
      );
      this._fireBase.sendNotification({
        token: fcm,
        data: {
          title: "login alert",
          body: `new login at ${new Date(Date.now())}`,
        },
      });
    } else if (!recorderedFcms.includes(fcm)) {
      recorderedFcms.push(fcm);
      await this._redisServices.addSet(
        {
          filter: email,
          subject: cacheKeyEnum.fcm,
        },
        recorderedFcms,
      );
      this._fireBase.sendNotifications({
        tokens: [...recorderedFcms, fcm],
        data: {
          title: "login alert",
          body: `new login at ${new Date(Date.now())}`,
        },
      });
    } else {
      this._fireBase.sendNotifications({
        tokens: recorderedFcms,
        data: {
          title: "login alert",
          body: `new login at ${new Date(Date.now())}`,
        },
      });
    }

    const data = function () {
      if (emailExists) {
        return "please confirm your login";
      } else {
        return generateTokens(emailExists! as HydratedDocument<IUser>);
      }
    };

    SuccessResponse({ res, data });
  };

  EnableTwoStepVerfiction = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { email } = req.body;
    const emailExists = await this._userModel.findOne({
      filter: { email },
    });
    if (!emailExists) ErrorConflict("email does not exists");
    await sendEmail({
      to: email,
      subject: mailEnum.twoStepVerfiction,
      data: Globalhash({
        plainText: Math.ceil(Math.random() * 10000).toString(),
      }),
    });

    SuccessResponse({ res, data: "verfiction email sent" });
  };

  confirmLogin = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { email, otp }: confirmEmailDTO = req.body;
    const emailExists: HydratedDocument<IUser> | null =
      await this._userModel.userEmailExists({ email });
    if (emailExists) {
      ErrorConflict("email doesn't exists");
    }
    if (emailExists?.confirmed == true)
      ErrorConflict("your email is already confirmed");

    const CachedOtp: string | void = await this._redisServices.getKey({
      key: this._redisServices.cacheKey({
        filter: email,
        subject: mailEnum.consrimSingUp,
      }),
    });
    if (!GlobalCompare({ plainText: otp, hashText: CachedOtp as string }))
      Errorforbidden("wrong otp code");

    await this._redisServices.deleteKey({
      key: this._redisServices.cacheKey({
        filter: email,
        subject: mailEnum.consrimSingUp,
      }),
    });

    SuccessResponse({
      res,
      data: generateTokens(emailExists! as HydratedDocument<IUser>),
    });
  };

  confirmMailAndEnaaleTwoStepVeffiction = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { email, otp }: confirmEmailDTO = req.body;
    const emailExists: HydratedDocument<IUser> | null =
      await this._userModel.userEmailExists({ email });
    if (emailExists) {
      ErrorConflict("email doesn't exists");
    }
    if (emailExists?.confirmed == true)
      ErrorConflict("your email is already confirmed");

    const CachedOtp: string | void = await this._redisServices.getKey({
      key: this._redisServices.cacheKey({
        filter: email,
        subject: mailEnum.consrimSingUp,
      }),
    });
    if (!GlobalCompare({ plainText: otp, hashText: CachedOtp as string }))
      Errorforbidden("wrong otp code");

    await this._redisServices.deleteKey({
      key: this._redisServices.cacheKey({
        filter: email,
        subject: mailEnum.consrimSingUp,
      }),
    });

    await this._userModel.findOneAndUpdate({
      filter: { email },
      update: { confirmed: true, twoStepVerfiction: true },
    });

    SuccessResponse({ res, data: "email confirmed" });
  };

  signUpAndLoginWithGmail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { idToken } = req.body;

    const Client = new OAuth2Client(O2AUTH_CLIENT_ID);

    const verifyIdToken: Promise<LoginTicket> = Client.verifyIdToken({
      idToken,
      audience: O2AUTH_CLIENT_ID,
    });

    const payload: TokenPayload | undefined = (
      await verifyIdToken
    ).getPayload();

    if (!payload) ErrorInteralServerError("invalid token id");
    const { name, email, email_verified, picture }: any = payload;

    let emailExists: HydratedDocument<IUser> | null =
      await this._userModel.userEmailExists({ email });
    if (!emailExists) {
      emailExists = await this._userModel.create({
        userName: name,
        email,
        provider: providerEnum.google,
        confirmed: email_verified,
      } as Partial<IUser>);
    }

    if (emailExists?.provider == providerEnum.system)
      ErrorConflict("please login throw system");

    const { accessToken, refreshToken } = generateTokens(emailExists);

    SuccessResponse({ res, data: { accessToken, refreshToken } });
  };

  reSendOtp = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { email }: resendOtpDTO = req.body;

    const user = await this._userModel.findOne({ filter: email as any });
    if (!user) {
      ErrorConflict("user does not exists");
    }

    await sendEmail({
      to: email,
      subject: mailEnum.reSendOtp,
      data: genrateOtp(),
    });

    SuccessResponse({ res, data: "otp send please confirm your mail" });
  };

  forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email }: forgetPasswordDTO = req.body;
    console.log(this._userModel);
    const userEmailExists: HydratedDocument<IUser> | null =
      await this._userModel.userEmailExists({ email, confirmed: true });
    if (!userEmailExists) {
      ErrorConflict("user does not exists");
    }

    await sendEmail({
      to: email,
      subject: mailEnum.forgetPassword,
      data: genrateOtp(),
    });
    SuccessResponse({ res, data: "please confirm your email" });
  };

  resetPassowrd = async (req: Request, res: Response, next: NextFunction) => {
    const { email, newPassword, otp }: resetPasswordDTO = req.body;
    const userEmailExists: HydratedDocument<IUser> | null =
      await this._userModel.userEmailExists({ email, confirmed: true });

    if (!userEmailExists) {
      ErrorConflict("email does not exists");
    }
    const CachedOtp: string = (await this._redisServices.getKey({
      key: this._redisServices.cacheKey({
        filter: email,
        subject: mailEnum.forgetPassword,
      }),
    })) as string;

    if (!GlobalCompare({ plainText: otp, hashText: CachedOtp })) {
      ErrorUnAuthorizedRequest("wrong otp");
    }
    await this._redisServices.deleteKey({
      key: this._redisServices.cacheKey({
        filter: email,
        subject: mailEnum.forgetPassword,
      }),
    });

    await this._userModel.findOneAndUpdate({
      filter: { email, confirmed: true },
      update: {
        password: Globalhash({ plainText: newPassword }),
      },
    });

    SuccessResponse({ res, data: "password updated" });
  };
}

export default new auth();
