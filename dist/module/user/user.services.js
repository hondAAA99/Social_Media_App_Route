import userRepo from "../../DB/repo/user.repo.js";
import { ErrorConflict, ErrorUnAuthorizedRequest, SuccessResponse, } from "../../common/utils/globalresponse.js";
import redisServices from "../../common/services/redis.services.js";
import { GlobalCompare, Globalhash } from "../../common/security/hash.js";
import cacheKeyEnum from "../../common/enum/cacheKey.enum.js";
import s3Services from "../../common/services/s3Services.js";
import postRepo from "../../DB/repo/post.repo.js";
import { Globalencrypt } from "../../common/security/encrypt.js";
import { postAvailbilty } from "../../common/utils/postUtils.js";
import availabiltyEnum from "../../common/enum/availablity.enum.js";
class userServices {
    _userModel = new userRepo();
    _redisServices = new redisServices();
    _s3services = new s3Services();
    _postModel = new postRepo();
    constructor() { }
    lockProfile = async (req, res, next) => {
        const { user } = req;
        const { flag } = req.query;
        if (user?.profileLock && flag == "true") {
            return ErrorConflict("the profile is already locked");
        }
        else if (!user?.profileLock && flag == "false") {
            return ErrorConflict("the profile is already unlocked");
        }
        await this._userModel.findByIdAndUpdate({
            id: user?.id,
            update: {
                profileLock: flag == "true" ? true : false,
            },
        });
        SuccessResponse({ res, data: "user data updated" });
    };
    getUserSharedData = async (req, res, next) => {
        const { user } = req;
        const { userId } = req.params;
        const sharedUser = await this._userModel.findById({ id: userId });
        if (sharedUser?.profileLock &&
            !sharedUser.friends.data.map((f) => {
                if (f == user?.id)
                    return true;
            })) {
            SuccessResponse({
                res,
                data: {
                    userName: sharedUser?.userName,
                    profilePicture: sharedUser?.profilePicture,
                    email: sharedUser?.email.availibilty == availabiltyEnum.public
                        ? sharedUser?.email.data
                        : undefined,
                    friends: sharedUser?.friends.availibilty == availabiltyEnum.public
                        ? sharedUser?.friends.data
                        : undefined,
                    phone: sharedUser?.phone?.availibilty == availabiltyEnum.public
                        ? sharedUser?.phone.data
                        : undefined,
                    age: sharedUser?.age?.availibilty == availabiltyEnum.public
                        ? sharedUser?.age.data
                        : undefined,
                    gender: sharedUser?.gender?.availibilty == availabiltyEnum.public
                        ? sharedUser?.gender.data
                        : undefined,
                    createdAt: sharedUser?.createdAt,
                },
            });
        }
        const sharedPosts = await this._postModel.findAll({
            filter: {
                createdBy: sharedUser?.id,
                availablity: {
                    $or: [...postAvailbilty(req)],
                },
            },
            options: {
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
            },
        });
        SuccessResponse({ res, data: { sharedUser, sharedPosts } });
    };
    getUserProfile = async (req, res, next) => {
        const { user } = req;
        const posts = await this._postModel.findAll({
            filter: {
                createdBy: user.id,
            },
            options: {
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
            },
        });
        SuccessResponse({ res, data: { user, posts } });
    };
    updateProfile = async (req, res, next) => {
        const { firstName, lastName, age, gender, phone, friends } = req.body;
        const { file } = req;
        const { user } = req.body;
        await this._userModel.findByIdAndUpdate({
            id: user?.id,
            update: {
                firstName,
                lastName,
                "age.data": age?.data,
                "aga.availibilty": age?.availibilty,
                "gender.data": gender?.data,
                "gender.availibilty": gender?.availibilty,
                "phone.data": Globalencrypt({ plainText: phone?.data }),
                "phone.availibilty": phone?.availibilty,
                "friends.availibilty": friends.availibilty,
                profilePicture: file
                    ? await this._s3services.uploadFile({
                        file: req.file,
                        path: `user/${user.email}/profile-photo`,
                    })
                    : undefined,
            },
        });
        SuccessResponse({ res, data: "user updated" });
    };
    updatePassword = async (req, res, next) => {
        const { oldPassword, newPassword } = req.body;
        const user = req.user;
        const hashOldPassword = user.password;
        if (!GlobalCompare({ plainText: oldPassword, hashText: hashOldPassword }))
            ErrorUnAuthorizedRequest("passwords does not match");
        await this._userModel.findOneAndUpdate({
            filter: { email: user.email, confirmed: true },
            update: { password: Globalhash({ plainText: newPassword }) },
        });
        SuccessResponse({ res, data: "password updated" });
    };
    deleteUser = async (req, res, next) => {
        const { user } = req;
        await this._userModel.findByIdAndDelete({
            id: user.id,
        });
        SuccessResponse({ res, data: "user deleted" });
    };
    logout = async (req, res, next) => {
        const { flag } = req.query;
        const user = req.user;
        if (flag == "all") {
            user.creadnatials = new Date(Date.now());
            user.save();
        }
        await this._redisServices.setKey({
            key: this._redisServices.cacheKey({
                filter: req.token,
                subject: cacheKeyEnum.revokeToken,
            }),
            value: user.email,
            ttl: Date.now() - req.tokenDecoded.iat * 1000,
        });
        SuccessResponse({ res, data: "logout succeded" });
    };
}
export default new userServices();
