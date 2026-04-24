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
class auth {
  private readonly _userModel = new userRepo();
  constructor() {}

  signUp = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const {
      userName,
      email,
      password,
      phone,
      gender,
    } = req.body;
    const emailExists : HydratedDocument<IUser> | null = await this._userModel.userEmailExists({email});
    if (emailExists) {
      ErrorConflict("email already exists");
    }

    const user: HydratedDocument<IUser> = await this._userModel.create({
      userName,
      email,
      password: Globalhash({ plainText: password }),
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
    const { email, password } = req.body;
    const emailExists :  HydratedDocument<IUser> | null= await this._userModel.userEmailExists({email , confirmed : true});
    if (!emailExists) {
      ErrorConflict("email doesn't exists");
    }
    if (!emailExists) ErrorConflict("email does not exists or confirmed");
    if (
      !GlobalCompare({ plainText: password, hashText: emailExists!.password })
    ) {
      Errorforbidden("wrong password");
    }

    const { accessToken, refreshToken } = generateTokens(
      emailExists as HydratedDocument<IUser>,
    );

    SuccessResponse({ res, data: { accessToken, refreshToken } });
  };

  confirmMail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { email , otp  } = req.body;
    const emailExists : HydratedDocument<IUser> | null = await this._userModel.userEmailExists({email});
    if (emailExists) {
      ErrorConflict("email doesn't exists");
    }
    if (emailExists?.confirmed == true ) ErrorConflict('your email is already confirmed')

    const CachedOtp : string | void = await redisServices.getKey({
      key: redisServices.cacheKey({
        filter: email,
        subject: mailEnum.consrimSingUp,
      }),
    });
    if (!GlobalCompare({ plainText: otp , hashText: CachedOtp as string}))
      Errorforbidden("wrong otp code");

    await redisServices.deleteKey({
      key: redisServices.cacheKey({
        filter: email,
        subject: mailEnum.consrimSingUp,
      }),
    });

    await this._userModel.findOneAndUpdate({
      filter: { email },
      update: { confirmed: true },
    })

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
      await this._userModel.userEmailExists({email});
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

  getProfile = (req: Request,
    res: Response,
    next: NextFunction)=>{
      SuccessResponse({res,data : {
        userName : req.user?.userName,
        email : req.user?.email,
        age : req.user?.age,
        gender : req.user?.gender,
        phone : Globaldecrypt({ cipherText : req.user?.phone! }) ,
      }})
    }

  reSendOtp = async(req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> =>  {
      const {email} = req.body

      const user = await this._userModel.findOne({filter : email! })
      if (!user){
        ErrorConflict('user does not exists');
      }

      await sendEmail({
        to : email ,
        subject : mailEnum.reSendOtp,
        data : genrateOtp(),
      })

      SuccessResponse({res,data : 'otp send please confirm your mail'})
  }

    forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    console.log(this._userModel)
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
  }

  resetPassowrd = async (req: Request, res: Response, next: NextFunction) => {
    const { email, newPassword, otp } = req.body;
    const userEmailExists: HydratedDocument<IUser> | null =
      await this._userModel.userEmailExists({ email, confirmed: true });

    if (!userEmailExists) {
      ErrorConflict("email does not exists");
    }
    const CachedOtp: string = (await redisServices.getKey({
      key: redisServices.cacheKey({
        filter: email,
        subject: mailEnum.forgetPassword,
      }),
    })) as string;

    if (!GlobalCompare({ plainText: otp, hashText: CachedOtp })) {
      ErrorUnAuthorizedRequest("wrong otp");
    }
    await redisServices.deleteKey({
      key: redisServices.cacheKey({
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
  }
}

export default new auth();
