import { NextFunction, Request, Response } from "express";
import postModel, { IPost } from "../../DB/models/post.model.js";
import {
  ErrorConflict,
  ErrorInteralServerError,
  ErrorUnAuthorizedRequest,
  SuccessResponse,
} from "../../common/utils/globalresponse.js";
import postRepo from "../../DB/repo/post.repo.js";
import { createPostDTO, updatePostDTO } from "./post.dto.js";
import userRepo from "../../DB/repo/user.repo.js";
import redisServices from "../../common/services/redis.services.js";
import cacheKeyEnum from "../../common/enum/cacheKey.enum.js";
import s3Services from "../../common/services/s3Services.js";
import { randomUUID } from "crypto";
import {
  HydratedDocument,
  ObjectId,
  QueryFilter,
  Schema,
  Types,
} from "mongoose";
import fireBaseServices from "../../common/services/fireBase.services.js";
import { postAvailbilty, searchQuery } from "../../common/utils/postUtils.js";
import { populate } from "dotenv";
import { match } from "assert";

class postServices {
  private readonly _postModel = new postRepo();
  private readonly _userModel = new userRepo();
  private readonly _redisServices = new redisServices();
  private readonly _s3Service = new s3Services();
  private readonly _fireBase = new fireBaseServices();
  constructor() {}

  createPost = async (req: Request, res: Response, next: NextFunction) => {
    const { availablity, content, tags, allowComments }: createPostDTO =
      req.body;
    const { user } = req;
    let mentionsArr;
    let fcmArr: string[] = [];

    const mentions: Schema.Types.ObjectId[] = [];

    if ((tags! as Array<any>).length) {
      mentionsArr = await this._userModel.findAll({
        filter: {
          _id: { $in: tags },
        },
      });

      if (mentionsArr && (tags! as Array<any>).length !== mentionsArr!.length) {
        ErrorConflict("invalid tags");
      }

      mentionsArr?.map(async (mention) => {
        mentions.push(mention.id);
        (
          await this._redisServices.getSet({
            filter: user!.email.data,
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
        data: {
          title: `${user?.userName} updated their post`,
          body: `${user?.userName} mentioned you in a post`,
        },
      });

      SuccessResponse({ res, data: post });
    }
  };

  getPosts = async (req: Request, res: Response, next: NextFunction) => {
    const posts = await this._postModel.paginate({
      page: Number(req?.query?.page!),
      limit: Number(req?.query?.limit!),
      search: {
        $or: [...postAvailbilty(req)],
        searchQuery,
      },
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
    });

    SuccessResponse({ res, data: posts });
  };

  likePost = async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;

    const { flag } = req.query;

    let queryFilter: QueryFilter<IPost> = {
      $addToSet: { likes: req?.user?._id! },
    };

    if (flag == "disLike") {
      queryFilter = {
        $pull: { likes: req?.user?._id! },
      };
    }

    const post = this._postModel.findOneAndUpdate({
      filter: {
        id: new Schema.Types.ObjectId(postId as string),
        createdBy: new Schema.Types.ObjectId(req?.user?.id as string),
      },
      update: {
        likes: queryFilter,
      },
    });

    if (!post) {
      ErrorInteralServerError("failed to like the post");
    }

    SuccessResponse({ res, data: "like!" });
  };

  updatePost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const { user } = req;
    const {
      allowComment,
      availability,
      content,
      tags,
      removeFiles,
      removeTags,
    }: updatePostDTO = req.body;

    const post = await this._postModel.findOne({
      filter: {
        _id: postId,
        createdBy: req?.user?.id!,
      },
    });

    if (!post) {
      ErrorConflict("posy not found or not authorized");
    }

    if (removeFiles?.length) {
      const inValidFiles = removeFiles.filter((file: string) => {
        return !post?.attachments?.includes(file);
      });

      if (inValidFiles?.length) {
        ErrorConflict("some of path file you want remove not exist");
      }

      await this._s3Service.deleteFiles({ Keys: removeFiles });

      post!.attachments = post?.attachments?.filter((file: string) => {
        return !removeFiles.includes(file);
      }) as string[];
    }

    const updateTags = new Set(post?.tags?.map((id) => id.toString()));

    (removeTags as Array<string>).forEach((tag: string) => {
      return updateTags.delete(tag);
    });

    let fcms_token: string[] = [];
    if ((tags as Array<string>).length!) {
      const mentionsTags = await this._userModel.findAll({
        filter: {
          _id: { $in: tags },
        },
      });

      if ((tags as Array<string>).length! !== mentionsTags!.length) {
        ErrorConflict("some person you mentioned not found");
      }

      for (const tag of mentionsTags!) {
        if (tag._id.toString() == req.user?._id.toString()) {
          ErrorConflict("you can not mention tou your self");
        }
        updateTags.add(tag._id.toString());
        (
          await this._redisServices.getSet({
            filter: req?.user?.email.data!,
            subject: cacheKeyEnum.fcm,
          })
        ).map((token) => {
          fcms_token.push(token);
        });
      }
    }

    post!.tags = [...updateTags].map(
      (id: string) => new Schema.Types.ObjectId(id),
    );

    if (fcms_token?.length) {
      await this._fireBase.sendNotifications({
        tokens: fcms_token,
        data: {
          title: `${user?.userName} updated their post`,
          body: `${user?.userName} mentioned you in a post`,
        },
      });
    }

    if (content) post!.content = content as string;
    if (availability) post!.availablity = availability as string;
    if (allowComment) post!.allowComments = allowComment as string;

    await post!.save();

    SuccessResponse({ res, data: " post updated" });
  };

  deletePost = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { postId } = req.params;

    await this._postModel.deleteOne({
      filter: {
        id: postId,
        createdBy: user?.id!,
      },
    });

    SuccessResponse({ res, data: "post deleted" });
  };
}

export default new postServices();
