import {
  ErrorConflict,
  SuccessResponse,
} from "../../common/utils/globalresponse.js";
import new postRepo() from "../../DB/repo/post.repo.js";
import new userRepo() from "../../DB/repo/user.repo.js";
import type { Request, Response, NextFunction } from "express";
import postServices from "../posts/post.services.js";
import { Schema } from "mongoose";
import postAvailbilty from "../../common/utils/postUtils.ts";

class newsFeed {
  private readonly _userModel = new userRepo();
  private readonly _postModel = new postRepo();
  private readonly _postServices = postServices;
  constructor() {}

  getFeed = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;
    const { limit, page } = req.query;
    const friends = user?.friends;

    const posts = this._postModel.paginate({
      search: {
        createdBy: { $in: friends || [] },
        availiabilty: this._postServices.postAvailbilty(req),
      },
      limit: +limit!,
      page: +page!,
    });

    SuccessResponse({ res, data: posts });
  };

  postReact = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const { user } = req;
    const post = await this._postModel.findOne({
      filter: {
        id: postId as Schema.Types.ObjectId,
        $or: this._postServices.postAvailbilty(req) as any[],
      },
    });
    if (!post) return ErrorConflict("post does not eists");
    post.reactCount = (post?.reactCount as number) + 1;
    post?.reactedUsers?.push(user!.id);

    await post!.save();
  };
}

export default new newsFeed();
