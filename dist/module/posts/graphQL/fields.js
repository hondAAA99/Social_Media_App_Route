import { authenticateGQL } from "../../../common/middleware/authenticate.js";
import postRepo from "../../../DB/repo/post.repo.js";
import { postData } from "./types.js";
class GLpostsFields {
    _postModel = new postRepo();
    constructor() { }
    getUserPosts = () => {
        return {
            type: postData,
            resolve: async (parent, args, context) => {
                const { user } = await authenticateGQL(context);
                const posts = this._postModel.findAll({
                    filter: {
                        createdBy: user?.id,
                    },
                    projection: "",
                });
                return posts;
            },
        };
    };
}
