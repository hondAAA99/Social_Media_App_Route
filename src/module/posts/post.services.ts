import { NextFunction, Request, Response } from "express";
import postModel from "../../DB/models/post.model.js";
import {
  ErrorConflict,
  ErrorInteralServerError,
  SuccessResponse,
} from "../../common/utils/globalresponse.js";
import postRepo from "../../DB/repo/post.repo.js";
import { createPostDTO } from "./post.dto.js";
import userRepo from "../../DB/repo/user.repo.js";
import redisServices from "../../common/services/redis.services.js";
import cacheKeyEnum from "../../common/enum/cacheKey.enum.js";
import s3Services from "../../common/services/s3Services.js";
import { randomUUID } from "crypto";
import { ObjectId, Schema, Types } from "mongoose";
import fireBaseServices from "../../common/services/fireBase.services.js";
import availabiltyEnum from "../../common/enum/availablity.enum.js";

class postServices {
  private readonly _postModel = postRepo;
  private readonly _userModel = userRepo;
  private readonly _redisServices = redisServices;
  private readonly _s3Service = s3Services;
  private readonly _fireBase = fireBaseServices;
  constructor() {}

  createPost = async (req: Request, res: Response, next: NextFunction) => {
    const { availablity, content, tags, allowComments }: createPostDTO =
      req.body;
    const { user } = req;
    let mentionsArr;
    let fcmArr: string[] = [];

    const mentions: Schema.Types.ObjectId[] = [];

    if (tags?.length) {
      mentionsArr = await this._userModel.findAll({
        filter: {
          _id: { $in: tags },
        },
      });

      if (mentionsArr && tags.length !== mentionsArr!.length) {
        ErrorConflict("invalid tags");
      }

      mentionsArr?.map(async (mention) => {
        mentions.push(mention.id);
        (
          await this._redisServices.getSet({
            filter: user!.email,
            subject: cacheKeyEnum.fcm,
          })
        ).map((token: string) => {
          fcmArr.push(token);
        });
      });

      const folderId = randomUUID();
      const Keys = await this._s3Service.uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${user?.email}/posts/${folderId}`,
      });

      const post = await this._postModel.create({
        content: content as string,
        availablity,
        tags: mentions,
        attachments: Keys,
        allowComments,
        createdBy: req?.user!.id,
        folderId,
      });

      if (!post) {
        await this._s3Service.deleteFiles({
          Keys,
        });
        ErrorInteralServerError("failed to create post");
      }

      await this._fireBase.sendNotifications({
        tokens: fcmArr,
      });

      SuccessResponse({ res, data: post });
    }
  };

  getPosts = async (req: Request, res: Response, next: NextFunction) => {
    const posts = await this._postModel.paginate({
      page: +req.body?.page,
      limit: +req.body?.limit,
      search: {
        $or: [
          postAvailbilty(req),
          ...searchQuery
        ],
      },
    });

    // const posts = await this._postModel.findAll({
    //   filter : {
    //
    // })
  };
}

function postAvailbilty(req: Request) {
  return [
    { availablity: availabiltyEnum.onlyMe, createdBy: req?.user!.id },
    {
      availablity: availabiltyEnum.freinds,
      tags: {
        $in: [req?.user!.id, [...req?.user!.friends]],
      },
    },
    { availablity: availabiltyEnum.public },
    { tags: { $in: [req?.user!.id] } },
  ];
}

export default new postServices();
