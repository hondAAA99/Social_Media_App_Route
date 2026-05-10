import commentRepo from "../../DB/repo/comment.repo.js";
import { ErrorUnAuthorizedRequest, SuccessResponse, } from "../../common/utils/globalresponse.js";
import s3Services from "../../common/services/s3Services.js";
class commentServices {
    _commentRepo = commentRepo;
    _s3Services = s3Services;
    constructor() { }
    createComment = async (req, res, next) => {
        const { content } = req.body;
        const { postId } = req.params;
        const { user } = req;
        if (!user)
            return next(new Error("Unauthorized"));
        let urls = req?.files
            ? await this._s3Services.uploadFiles({
                files: req?.files,
            })
            : [];
        const comments = await this._commentRepo.create({
            content,
            attachments: urls,
            postId,
            createdBy: user.id,
        });
        SuccessResponse({ res, data: "comment added" });
    };
    getComments = async (req, res, next) => {
        const { postId } = req.params;
        const { limit, page } = req.query;
        const comments = await this._commentRepo.paginate({
            limit: +limit,
            page: +page,
            search: {
                postId,
            },
        });
        SuccessResponse({ res, data: comments });
    };
    updateComment = async (req, res, next) => {
        const { content } = req.body;
        const { postId } = req.params;
        const { user } = req;
        if (!user)
            return next(new Error("Unauthorized"));
        const comments = await this._commentRepo.findOneAndUpdate({
            filter: {
                postId,
                createdBy: user.id,
            },
            update: {
                content,
            },
        });
        SuccessResponse({ res, data: "comment updated" });
    };
    deleteComments = async (req, res, next) => {
        const { commentId } = req.body;
        const { user } = req;
        const comment = await this._commentRepo.findById({
            id: commentId,
        });
        if (comment?.createdBy != user?.id)
            ErrorUnAuthorizedRequest("you cannot delete this comment");
        comment?.attachments
            ? await this._s3Services.deleteFiles({
                Keys: comment?.attachments,
            })
            : undefined;
        await this._commentRepo.deleteOne({
            filter: {
                id: commentId,
                createdBy: user.id,
            },
        });
        SuccessResponse({ res, data: "comment deleted" });
    };
}
export default new commentServices();
