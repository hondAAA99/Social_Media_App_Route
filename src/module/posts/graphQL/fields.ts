import { authenticateGQL } from "../../../common/middleware/authenticate.js";
import postRepo from "../../../DB/repo/post.repo.js";
import { postData } from "./types.js";

class GLpostsFields {
  private readonly _postModel = new postRepo();
  constructor() {}
  getAllUserPosts = () => {
    return {
      type: postData,
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
}

export default new GLpostsFields()
