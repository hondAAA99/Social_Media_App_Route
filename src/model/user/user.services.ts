import type { Request,Response,NextFunction } from "express"
import userRepo from "../../DB/repo/user.repo.js";
import {
  ErrorConflict,
  ErrorUnAuthorizedRequest,
  SuccessResponse,
} from "../../common/utils/globalresponse.js";
import { sendEmail } from "../../common/utils/email/sendEmail.js";
import mailEnum from "../../common/enum/mail.enum.js";
import { genrateOtp } from "../../common/utils/email/nodeMailer.js";
import redisServices from "../../DB/Redis/redis.services.js";
import { GlobalCompare, Globalhash } from "../../common/security/hash.js";
import { HydratedDocument } from "mongoose";
import { IUser } from "../../DB/models/user.model.js";
import { email, number } from "zod";
import cacheKeyEnum from "../../common/enum/cacheKey.enum.js";

class userServices {
  private readonly _userModel = new userRepo();

  constructor() {}

  async forgetPassword(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;
    const userEmailExists: HydratedDocument<IUser> | null =
      await this._userModel.userEmailExists({ email, confirmed: true });

    if (userEmailExists) {
      ErrorConflict("email does not exists");
    }

    await sendEmail({
      to: email,
      subject: mailEnum.forgetPassword,
      data: genrateOtp(),
    });
    SuccessResponse({ res, data: "please confirm your email" });
  }

  async resetPassowrd(req: Request, res: Response, next: NextFunction) {
    const { email, newPassword, otp } = req.body;
    const userEmailExists: HydratedDocument<IUser> | null =
      await this._userModel.userEmailExists({ email, confirmed: true });

    if (userEmailExists) {
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

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    const { oldPassword, newPassword } = req.body;
    const user: HydratedDocument<IUser> = req.user as HydratedDocument<IUser>;
    const hashOldPassword = user.password;
    if (!GlobalCompare({ plainText: oldPassword, hashText: hashOldPassword }))
      ErrorUnAuthorizedRequest("passwords does not match");

    await this._userModel.findOneAndUpdate({
      filter: { email: user.email, confirmed: true },
      update: { password: Globalhash({ plainText: newPassword }) },
    });

    SuccessResponse({ res, data: "password updated" });
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    const {flag} = req.params;
    const user : HydratedDocument<IUser> = req.user as HydratedDocument<IUser>
    if (flag){
      user.creadnatials = new Date(Date.now());
      user.save();
      await redisServices.deleteKey({
        key : redisServices.cacheKey({filter : user.email , subject : cacheKeyEnum.revokeToken})
      })
      SuccessResponse({res ,data : "logout succeded from all devices"})
    }
    await redisServices.setKey({
      key : redisServices.cacheKey({filter : req.token as string , subject : cacheKeyEnum.revokeToken }),
      value : user.email,
      ttl :  (Date.now() - req.tokenDecoded.iat*1000)
    })
    SuccessResponse({res ,data : "logout succeded"})
  }
}

export default new userServices() ;