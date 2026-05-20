import { ErrorConflict, SuccessResponse, } from "../../common/utils/globalresponse.js";
import postRepo from "../../DB/repo/post.repo.js";
import userRepo from "../../DB/repo/user.repo.js";
import postServices from "../posts/post.services.js";
import { postAvailbilty } from "../../common/utils/postUtils.js";
class newsFeed {
    _userModel = new userRepo();
    _postModel = new postRepo();
    _postServices = postServices;
    constructor() { }
    getFeed = async (req, res, next) => {
        const { user } = req;
        const { limit, page } = req.query;
        const friends = user?.friends;
        const posts = this._postModel.paginate({
            search: {
                createdBy: { $in: friends || [] },
                availiabilty: postAvailbilty(req),
            },
            limit: +limit,
            page: +page,
        });
        SuccessResponse({ res, data: posts });
    };
    postReact = async (req, res, next) => {
        const { postId } = req.params;
        const { user } = req;
        const post = await this._postModel.findOne({
            filter: {
                id: postId,
                $or: [...postAvailbilty(req)],
            },
        });
        if (!post)
            return ErrorConflict("post does not eists");
        post.reactCount = post?.reactCount + 1;
        post?.reactedUsers?.push(user.id);
        await post.save();
    };
}
export default new newsFeed();
