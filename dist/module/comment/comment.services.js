import commentRepo from "../../DB/repo/comment.repo.js";
import { ErrorConflict, ErrorInteralServerError, ErrorNotFound, ErrorUnAuthorizedRequest, SuccessResponse, } from "../../common/utils/globalresponse.js";
import s3Services from "../../common/services/s3Services.js";
import postRepo from "../../DB/repo/post.repo.js";
import { postAvailbilty } from "../../common/utils/postUtils.js";
import allowCommentsEnum from "../../common/enum/allowComments.enum.js";
import userRepo from "../../DB/repo/user.repo.js";
import redisService from "../../common/services/redis.services.js";
import cacheKeyEnum from "../../common/enum/cacheKey.enum.js";
import { randomUUID } from "crypto";
import fireBaseServices from "../../common/services/fireBase.services.js";
import onModelEnum from "../../common/enum/onModel.enum.js";
class commentServices {
    _commentRepo = new commentRepo();
    _userRepo = new userRepo();
    _redisServices = new redisService();
    _s3Services = new s3Services();
    _postRepo = new postRepo();
    _fireBase = new fireBaseServices();
    constructor() { }
    createComment = async (req, res, next) => {
        const { content, tags, onModel } = req.body;
        const { postId, commentId } = req.params;
        const { user } = req;
        const doc = await (async () => {
            if (onModelEnum.post == onModel && !commentId) {
                return (await this._postRepo.findOne({
                    filter: {
                        id: postId,
                        $or: postAvailbilty(req),
                        allowComments: allowCommentsEnum.allow,
                    },
                }));
            }
            else if (onModelEnum.comment == onModel && commentId) {
                return (await this._commentRepo.findOne({
                    filter: {
                        id: commentId,
                        postId: postId,
                        options: {
                            populate: {
                                path: "postId",
                                match: {
                                    $or: postAvailbilty(req),
                                    allowComments: allowCommentsEnum.allow,
                                },
                            },
                        },
                    },
                }));
            }
            else {
                return null;
            }
        })();
        if (!doc)
            return ErrorConflict("cannot found the target document");
        let arrMentions = [];
        let arrFcms = [];
        if (!tags?.length) {
            const tagedUsers = await this._userRepo.findAll({
                filter: {
                    $in: [...tags],
                },
            });
            if (tagedUsers.length != tags.length) {
                return ErrorNotFound("some of taged users are not exists");
            }
            for (const tag of tags) {
                if (tag == user.id) {
                    return ErrorConflict("you cannot tag yourself");
                }
                arrMentions.push(tag);
                const fcms = this._redisServices.getSet({
                    filter: user?.email.data,
                    subject: cacheKeyEnum.fcm,
                });
                arrFcms.push(fcms);
            }
        }
        let urls = [];
        const folderId = randomUUID();
        if (req?.files) {
            urls = await this._s3Services.uploadFiles({
                files: req?.files,
                path: `${doc?.folderId}/comments/${folderId}`,
            });
        }
        const comment = await this._commentRepo.create({
            content,
            tags: arrMentions,
            attachments: urls,
            refId: doc?.id,
            createdBy: user?.id,
            folderId,
        });
        if (!comment) {
            await this._s3Services.deleteFiles({
                Keys: urls,
            });
            return ErrorInteralServerError("failed to add comment to the post");
        }
        await this._fireBase.sendNotifications({
            tokens: arrFcms,
            data: {
                title: `sommone has mentioned you in a comment`,
                body: `${user?.userName} mentioned you in a comment`,
            },
        });
        SuccessResponse({ res, data: comment });
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
            populate: {
                path: "comments",
                match: {
                    commentId: { $exists: false },
                },
                populate: {
                    path: "replies",
                },
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
