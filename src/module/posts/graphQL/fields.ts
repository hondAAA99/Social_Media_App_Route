import { authenticateGQL } from "../../../common/middleware/authenticate.js";
import { postAvailbilty } from "../../../common/utils/postUtils.js";
import postModel from "../../../DB/models/post.model.js";
import postRepo from "../../../DB/repo/post.repo.js";
import { GQLPostsType } from "./types.js";

class GLpostsFields {
  private readonly _postModel = new postRepo();
  constructor() {}
  getUserPosts = () => {
    return {
      type: GQLPostsType,
      resolve: async (parent: any, args: any, context: any) => {
        const { user } = await authenticateGQL(context);
        const posts = this._postModel.findAll({
          filter: {
            createdBy: user?.id!,
          },
          projection: "",
        });

        return posts;
      },
    };
  };
  //   getUserSharedPosts = () => {
  //     return {
  //       type: GQLPostsType,
  //       resolve: async (parent: any, args: any, context: any) => {
  //         const { user } = await authenticateGQL(context);
  //         const posts = this._postModel.findAll({
  //           filter: {
  //             createdBy: user?.id!,
  //             availablity : {
  //                $in : [...postAvailbilty(context.req)]
  //             }
  //           },
  //           projection : ''
  //         });

  //         return posts
  //       },
  //     };
  //   };
}
