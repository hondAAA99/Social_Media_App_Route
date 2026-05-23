import { GraphQLList, GraphQLObjectType } from "graphql";
import { authenticateGQL } from "../../../common/middleware/authenticate.js";
import { userData } from "./types.js";
import { postData } from "../../posts/graphQL/types.js";
import postRepo from "../../../DB/repo/post.repo.js";

class GqlUserFields {
  private readonly _postModel = new postRepo();
  constructor() {}

  getUserDataAndPosts = () => {
    return {
      type: new GraphQLObjectType({
        name: "userAndPosts",
        fields: {
          user: { type: userData },
          posts: { type: new GraphQLList(postData) },
        },
      }),
      args: {},
      resolve: async (parent: any, args: any, context: any) => {
        const { user } = await authenticateGQL(context);
        const posts = await this._postModel.findAll({
          filter: {
            createdBy: user!.id,
          },
        });
        return { user, posts };
      },
    };
  };
}

export default new GqlUserFields();
