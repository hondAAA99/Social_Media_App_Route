import s3services from '../../common/services/s3Services.js';
import postRepo from '../../DB/repo/post.repo.js';
import storyRepo from '../../DB/repo/story.repo.js';
import userRepo from '../../DB/repo/user.repo.js';
import { ErrorConflict, ErrorNotFound, ErrorUnAuthorizedRequest, SuccessResponse, } from '../../common/utils/globalresponse.js';
import { friendsFlagEnum } from '../../common/enum/friendsFlag.enum.js';
import redisService from '../../common/services/redis.services.js';
import cacheKeyEnum from '../../common/enum/cacheKey.enum.js';
class storyServices {
    _userModel = new userRepo();
    _s3services = new s3services();
    _postModel = new postRepo();
    _storyModel = new storyRepo();
    _redisServices = new redisService();
    constructor() { }
    createStory = async (req, res, next) => {
        const { user } = req;
        const { file } = req;
        const { text, backGroundColor, excludeUsers, availiabilty } = req.body;
        let url;
        if (file) {
            url = await this._s3services.uploadFile({
                file: file,
                path: `users/${user?.email.data}/storiess`,
            });
        }
        if (excludeUsers.length) {
            excludeUsers.map(async (ex) => {
                ex?.id == user?.id
                    ? ErrorConflict('you can not exclude yourself')
                    : true;
                const findUser = await this._userModel.findById({
                    id: ex.id,
                });
                if (!findUser)
                    ErrorConflict('can not find user');
            });
        }
        await Promise.all([
            this._storyModel.create({
                createdBy: user?.id,
                url: url,
                text,
                backGroundColor,
                excludeUsers,
                availability: availiabilty,
                expiresAt: 1000 * 60 * 60 * 24,
            }),
            user?.friends.data.forEach(async (fr) => {
                await this._redisServices.deleteKey({
                    key: this._redisServices.cacheKey({
                        filter: fr?.friendId,
                        subject: cacheKeyEnum.story,
                    }),
                });
            }),
        ]);
        const cachedKeys = SuccessResponse({ res, data: 'story uploaded' });
    };
    getFeed = async (req, res, next) => {
        const { user } = req;
        const cachedStories = await this._redisServices.getKey({
            key: this._redisServices.cacheKey({
                filter: user?.email.data,
                subject: cacheKeyEnum.story,
            }),
        });
        if (cachedStories) {
            SuccessResponse({ res, data: cachedStories });
        }
        const userAllFriends = user?.friends.data;
        const userAcceptedFriends = userAllFriends?.map(fr => {
            return fr.flag == friendsFlagEnum.friend ? fr.friendId : null;
        });
        if (!userAcceptedFriends) {
            SuccessResponse({ res, data: 'follow to see more' });
        }
        const stories = (await this._storyModel.findAll({
            filter: {
                createdBy: { $in: userAcceptedFriends },
                excludeUsers: { $nin: [user?.id] },
            },
            options: {
                sort: { createdAt: -1 },
                populate: [
                    {
                        path: 'createdBy',
                        select: 'firstName lastName email',
                    },
                ],
            },
        }));
        const groupStoriesByUser = stories.map(story => {
            let userStories = {
                createdBy: story.createdBy,
                stories,
            };
            stories.forEach(story => {
                story.createdBy.toString() == userStories.createdBy.toString()
                    ? userStories.stories.push(story)
                    : null;
            });
        });
        await this._redisServices.setKey({
            key: this._redisServices.cacheKey({
                filter: user?.id,
                subject: cacheKeyEnum.story,
            }),
            value: groupStoriesByUser,
            ttl: 60 * 15,
        });
        SuccessResponse({ res, data: groupStoriesByUser });
    };
    viewStory = async (req, res, next) => {
        const { user } = req;
        const { storyId } = req.params;
        const story = await this._storyModel.findById({ id: storyId });
        story?.views.push({
            userId: user?.id,
            viewDate: new Date(),
        });
        story?.save();
        SuccessResponse({ res, data: 'story viewed' });
    };
    getViewers = async (req, res, next) => {
        const { user } = req;
        const { storyId } = req.params;
        const story = await this._storyModel.findById({
            id: storyId,
            populate: { path: 'views.userId', select: 'firstName lastName email' },
        });
        if (!story) {
            return ErrorNotFound('story not found');
        }
        if (story.createdBy.toString() !== user?.id.toString()) {
            return ErrorUnAuthorizedRequest('you are not allowed to see viewers');
        }
        SuccessResponse({
            res,
            data: { viewers: story?.views, viewCount: story?.views.length },
        });
    };
    deleteStory = async (req, res, next) => {
        const { user } = req;
        const { storyId } = req.params;
        const story = await this._storyModel.findById({ id: storyId });
        if (!story) {
            return ErrorNotFound('story not found');
        }
        if (story.createdBy.toString() !== user?.id.toString()) {
            return ErrorUnAuthorizedRequest('you are not allowed to delete this story');
        }
        await this._storyModel.deleteOne({ filter: { id: storyId } });
        await this._s3services.deleteFile({ Key: story.url });
        await this._redisServices.deleteKey({
            key: this._redisServices.cacheKey({
                filter: user?.id,
                subject: cacheKeyEnum.story,
            }),
        });
        SuccessResponse({ res, data: 'story deleted' });
    };
}
export default new storyServices();
