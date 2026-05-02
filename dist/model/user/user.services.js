import userRepo from "../../DB/repo/user.repo.js";
import { ErrorUnAuthorizedRequest, SuccessResponse, } from "../../common/utils/globalresponse.js";
import redisServices from "../../common/services/redis.services.js";
import { GlobalCompare, Globalhash } from "../../common/security/hash.js";
import cacheKeyEnum from "../../common/enum/cacheKey.enum.js";
class userServices {
    _userModel = new userRepo();
    constructor() { }
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
    logout = async (req, res, next) => {
        const { flag } = req.query;
        const user = req.user;
        if (flag == 'all') {
            user.creadnatials = new Date(Date.now());
            user.save();
        }
        await redisServices.setKey({
            key: redisServices.cacheKey({ filter: req.token, subject: cacheKeyEnum.revokeToken }),
            value: user.email,
            ttl: (Date.now() - req.tokenDecoded.iat * 1000)
        });
        SuccessResponse({ res, data: "logout succeded" });
    };
}
export default new userServices();
