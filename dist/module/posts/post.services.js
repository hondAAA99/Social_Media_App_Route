import { ErrorConflict, ErrorInteralServerError, ErrorNotFound, SuccessResponse, } from "../../common/utils/globalresponse.js";
import postRepo from "../../DB/repo/post.repo.js";
import userRepo from "../../DB/repo/user.repo.js";
import redisServices from "../../common/services/redis.services.js";
import cacheKeyEnum from "../../common/enum/cacheKey.enum.js";
import s3Services from "../../common/services/s3Services.js";
import { randomUUID } from "crypto";
import { Schema, } from "mongoose";
import fireBaseServices from "../../common/services/fireBase.services.js";
import { postAvailbilty, searchQuery } from "../../common/utils/postUtils.js";
class postServices {
    _postModel = new postRepo();
    _userModel = new userRepo();
    _redisServices = new redisServices();
    _s3Service = new s3Services();
    _fireBase = new fireBaseServices();
    constructor() { }
    createPost = async (req, res, next) => {
        const { availablity, content, tags, allowComments, hideLikeCount, } = req.body;
        const { user } = req;
        let mentionsArr;
        let fcmArr = [];
        const mentions = [];
        if (tags.length) {
            mentionsArr = await this._userModel.findAll({
                filter: {
                    _id: { $in: tags },
                },
            });
            if (mentionsArr && tags.length !== mentionsArr.length) {
                ErrorConflict("invalid tags");
            }
            mentionsArr?.map(async (mention) => {
                mentions.push(mention.id);
                (await this._redisServices.getSet({
                    filter: user.email.data,
                    subject: cacheKeyEnum.fcm,
                })).map((token) => {
                    fcmArr.push(token);
                });
            });
            const folderId = randomUUID();
            const Keys = await this._s3Service.uploadFiles({
                files: req.files,
                path: `users/${user?.email}/posts/${folderId}`,
            });
            const post = await this._postModel.create({
                content: content,
                availablity,
                tags: mentions,
                attachments: Keys,
                allowComments,
                createdBy: req?.user.id,
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
            post.reacts.reactAviliablity = hideLikeCount;
            SuccessResponse({ res, data: post });
        }
    };
    getPosts = async (req, res, next) => {
        const posts = await this._postModel.paginate({
            page: Number(req?.query?.page),
            limit: Number(req?.query?.limit),
            search: {
                $or: [...postAvailbilty(req), searchQuery(req)],
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
    likePost = async (req, res, next) => {
        const postId = req.params.postId;
        const { flag } = req.query;
        const { user } = req;
        const post = await this._postModel.findById({ id: postId });
        if (!post)
            return ErrorNotFound("post not found");
        const reactPath = `reacts.reactsCount.${flag}`;
        await this._postModel.findByIdAndUpdate({
            id: postId,
            update: {
                $inc: { reactPath: 1, " reacts.reactsCount.total": 1 },
            },
        });
        post.reacts.reactedUsers.push({
            userId: user?.id,
            react: flag,
        });
        await post.save();
        SuccessResponse({ res, data: "like!" });
    };
    updatePost = async (req, res, next) => {
        const { postId } = req.params;
        const { user } = req;
        const { allowComment, availability, content, tags, removeFiles, removeTags, hideLikeCount, } = req.body;
        const post = await this._postModel.findOne({
            filter: {
                _id: postId,
                createdBy: req?.user?.id,
            },
        });
        if (!post) {
            ErrorConflict("posy not found or not authorized");
        }
        if (removeFiles?.length) {
            const inValidFiles = removeFiles.filter((file) => {
                return !post?.attachments?.includes(file);
            });
            if (inValidFiles?.length) {
                ErrorConflict("some of path file you want remove not exist");
            }
            await this._s3Service.deleteFiles({ Keys: removeFiles });
            post.attachments = post?.attachments?.filter((file) => {
                return !removeFiles.includes(file);
            });
        }
        const updateTags = new Set(post?.tags?.map((id) => id.toString()));
        removeTags.forEach((tag) => {
            return updateTags.delete(tag);
        });
        let fcms_token = [];
        if (tags.length) {
            const mentionsTags = await this._userModel.findAll({
                filter: {
                    _id: { $in: tags },
                },
            });
            if (tags.length !== mentionsTags.length) {
                ErrorConflict("some person you mentioned not found");
            }
            for (const tag of mentionsTags) {
                if (tag._id.toString() == req.user?._id.toString()) {
                    ErrorConflict("you can not mention tou your self");
                }
                updateTags.add(tag._id.toString());
                (await this._redisServices.getSet({
                    filter: req?.user?.email.data,
                    subject: cacheKeyEnum.fcm,
                })).map((token) => {
                    fcms_token.push(token);
                });
            }
        }
        post.tags = [...updateTags].map((id) => new Schema.Types.ObjectId(id));
        if (fcms_token?.length) {
            await this._fireBase.sendNotifications({
                tokens: fcms_token,
                data: {
                    title: `${user?.userName} updated their post`,
                    body: `${user?.userName} mentioned you in a post`,
                },
            });
        }
        if (content)
            post.content = content;
        if (availability)
            post.availablity = availability;
        if (allowComment)
            post.allowComments = allowComment;
        if (hideLikeCount)
            post.reacts.reactAviliablity = hideLikeCount;
        await post.save();
        SuccessResponse({ res, data: " post updated" });
    };
    deletePost = async (req, res, next) => {
        const { user } = req;
        const { postId } = req.params;
        await this._postModel.deleteOne({
            filter: {
                id: postId,
                createdBy: user?.id,
            },
        });
        SuccessResponse({ res, data: "post deleted" });
    };
}
export default new postServices();
