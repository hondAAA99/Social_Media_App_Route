import userRepo from "../../DB/repo/user.repo.js";
import { ErrorUnAuthorizedRequest, SuccessResponse, } from "../../common/utils/globalresponse.js";
import redisServices from "../../common/services/redis.services.js";
import { GlobalCompare, Globalhash } from "../../common/security/hash.js";
import cacheKeyEnum from "../../common/enum/cacheKey.enum.js";
import s3Services from "../../common/services/s3Services.js";
import postRepo from "../../DB/repo/post.repo.js";
import { Globalencrypt } from "../../common/security/encrypt.js";
class userServices {
    _userModel = new userRepo();
    _redisServices = new redisServices();
    _s3services = new s3Services();
    _postModel = new postRepo();
    constructor() { }
    getUserSharedData = async (req, res, next) => { };
    getUserProfile = async (req, res, next) => {
        const { user } = req;
        const posts = await this._postModel.findAll({
            filter: {
                createdBy: user.id,
            },
        });
        SuccessResponse({ res, data: { user, posts } });
    };
    updateProfile = async (req, res, next) => {
        const { firstName, lastName, age, gender, phone } = req.body;
        const { file } = req;
        const { user } = req.body;
        await this._userModel.findByIdAndUpdate({
            id: user?.id,
            update: {
                firstName,
                lastName,
                age,
                gender,
                phone: Globalencrypt({ plainText: phone?.data }),
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
