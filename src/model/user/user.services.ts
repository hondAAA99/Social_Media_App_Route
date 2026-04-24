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
import redisServices from "../../common/services/redis.services.js";
import { GlobalCompare, Globalhash } from "../../common/security/hash.js";
import { HydratedDocument } from "mongoose";
import { IUser } from "../../DB/models/user.model.js";
import cacheKeyEnum from "../../common/enum/cacheKey.enum.js";

class userServices {
  private readonly _userModel = new userRepo();

  constructor() {}

  updatePassword = async (req: Request, res: Response, next: NextFunction) => {
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

  logout = async (req: Request, res: Response, next: NextFunction) => {
    const {flag} = req.query;
    const user : HydratedDocument<IUser> = req.user as HydratedDocument<IUser>
    if (flag == 'all'){
      user.creadnatials = new Date(Date.now());
      user.save();
      // await redisServices.deleteKey({
      //   key : redisServices.cacheKey({filter : user.email , subject : cacheKeyEnum.revokeToken})
      // })
      // SuccessResponse({res ,data : "logout succeded from all devices"})
    }
    await redisServices.setKey({
      key : redisServices.cacheKey({filter : req.token as string , subject : cacheKeyEnum.revokeToken }),
      value : user.email,
      ttl :  (Date.now() - req.tokenDecoded.iat!*1000)
    })
    SuccessResponse({res ,data : "logout succeded"})
  }

}

export default new userServices() ;