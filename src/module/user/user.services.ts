import type { Request, Response, NextFunction } from "express";
import userRepo from "../../DB/repo/user.repo.js";
import {
  ErrorUnAuthorizedRequest,
  SuccessResponse,
} from "../../common/utils/globalresponse.js";
import redisServices from "../../common/services/redis.services.js";
import { GlobalCompare, Globalhash } from "../../common/security/hash.js";
import { HydratedDocument, Schema } from "mongoose";
import { IUser } from "../../DB/models/user.model.js";
import cacheKeyEnum from "../../common/enum/cacheKey.enum.js";
import s3Services from "../../common/services/s3Services.js";
import { pipeline } from "stream/promises";
import postRepo from "../../DB/repo/post.repo.js";
import { Globaldecrypt, Globalencrypt } from "../../common/security/encrypt.js";

class userServices {
  private readonly _userModel = new userRepo();
  private readonly _redisServices = new redisServices();
  private readonly _s3services = new s3Services();
  private readonly _postModel = new postRepo();

  constructor() {}

  getUserSharedData = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {};

  getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const posts = await this._postModel.findAll({
      filter: {
        createdBy: user!.id,
      },
    });

    SuccessResponse({ res, data: { user, posts } });
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, age, gender, phone }: IUser = req.body;
    const { file } = req;
    const { user } = req.body;
    await this._userModel.findByIdAndUpdate({
      id: user?.id,
      update: {
        firstName,
        lastName,
        age,
        gender,
        phone: Globalencrypt({ plainText: phone?.data! }),
        profilePicture: file
          ? await this._s3services.uploadFile({
              file: req.file as Express.Multer.File,
              path: `user/${user.email}/profile-photo`,
            })
          : undefined,
      },
    });

    SuccessResponse({ res, data: "user updated" });
  };

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
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    await this._userModel.findByIdAndDelete({
      id: user!.id,
    });

    SuccessResponse({ res, data: "user deleted" });
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    const { flag } = req.query;
    const user: HydratedDocument<IUser> = req.user as HydratedDocument<IUser>;
    if (flag == "all") {
      user.creadnatials = new Date(Date.now());
      user.save();
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
    });
    SuccessResponse({ res, data: "logout succeded" });
  };
}

export default new userServices();
