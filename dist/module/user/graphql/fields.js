import { GraphQLList, GraphQLObjectType, } from "graphql";
import { authenticateGQL } from "../../../common/middleware/authenticate.js";
import postModel from "../../../DB/models/post.model.js";
import { postData, userData } from "./types.js";
class GqlUserFields {
    _postModel = new postModel();
    constructor() { }
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
            resolve: async (parent, args, context) => {
                const { user } = await authenticateGQL(context);
                const posts = await this._postModel.findAll({
                    filter: {
                        createdBy: user.id,
                    },
                });
                return { user, posts };
            },
        };
    };
}
export default new GqlUserFields();
