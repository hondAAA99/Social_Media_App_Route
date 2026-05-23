import type { Request, Response, NextFunction } from "express";
import userRepo from "../../DB/repo/user.repo.js";
import {
  ErrorConflict,
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
import { postAvailbilty } from "../../common/utils/postUtils.js";
import availabiltyEnum from "../../common/enum/availablity.enum.js";

class userServices {
  private readonly _userModel = new userRepo();
  private readonly _redisServices = new redisServices();
  private readonly _s3services = new s3Services();
  private readonly _postModel = new postRepo();

  constructor() {}

  lockProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { flag } = req.query;
    if (user?.profileLock && flag == "true") {
      return ErrorConflict("the profile is already locked");
    } else if (!user?.profileLock && flag == "false") {
      return ErrorConflict("the profile is already unlocked");
    }
    await this._userModel.findByIdAndUpdate({
      id: user?.id!,
      update: {
        profileLock: flag == "true" ? true : false,
      },
    });

    SuccessResponse({ res, data: "user data updated" });
  };

  getUserSharedData = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { user } = req;
    const { userId } = req.params;
    const sharedUser = await this._userModel.findById({ id: userId });

    if (
      sharedUser?.profileLock &&
      !sharedUser.friends.data.map((f) => {
        if (f == user?.id) return true;
      })
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
      });
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
            path: "comments",
            match: {
              commentId: { $exists: false },
            },
            populate: {
              path: "replies",
            },
          },
        ],
      },
    });

    SuccessResponse({ res, data: { sharedUser, sharedPosts } });
  };

  getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    // get posts and theire comments
    const posts = await this._postModel.findAll({
      filter: {
        createdBy: user!.id,
      },
      options: {
        populate: [
          {
            path: "comments",
            match: {
              commentId: { $exists: false },
            },
            populate: {
              path: "replies",
            },
          },
        ],
      },
    });
    SuccessResponse({ res, data: { user, posts } });
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, age, gender, phone, friends }: IUser =
      req.body;
    const { file } = req;
    const { user } = req.body;
    await this._userModel.findByIdAndUpdate({
      id: user?.id,
      update: {
        firstName,
        lastName,
        "age.data": age?.data,
        "aga.availibilty": age?.availibilty,
        "gender.data": gender?.data,
        "gender.availibilty": gender?.availibilty,
        "phone.data": Globalencrypt({ plainText: phone?.data! }),
        "phone.availibilty": phone?.availibilty,
        "friends.availibilty": friends.availibilty,
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
