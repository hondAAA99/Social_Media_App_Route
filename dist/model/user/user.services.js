import userRepo from "../../DB/repo/user.repo.js";
import { ErrorConflict, ErrorUnAuthorizedRequest, SuccessResponse, } from "../../common/utils/globalresponse.js";
import { sendEmail } from "../../common/utils/email/sendEmail.js";
import mailEnum from "../../common/enum/mail.enum.js";
import { genrateOtp } from "../../common/utils/email/nodeMailer.js";
import redisServices from "../../DB/Redis/redis.services.js";
import { GlobalCompare, Globalhash } from "../../common/security/hash.js";
import cacheKeyEnum from "../../common/enum/cacheKey.enum.js";
class userServices {
    _userModel = new userRepo();
    constructor() { }
    forgetPassword = async (req, res, next) => {
        const { email } = req.body;
        console.log(this._userModel);
        const userEmailExists = await this._userModel.userEmailExists({ email, confirmed: true });
        if (!userEmailExists) {
            ErrorConflict("user does not exists");
        }
        await sendEmail({
            to: email,
            subject: mailEnum.forgetPassword,
            data: genrateOtp(),
        });
        SuccessResponse({ res, data: "please confirm your email" });
    };
    resetPassowrd = async (req, res, next) => {
        const { email, newPassword, otp } = req.body;
        const userEmailExists = await this._userModel.userEmailExists({ email, confirmed: true });
        if (!userEmailExists) {
            ErrorConflict("email does not exists");
        }
        const CachedOtp = (await redisServices.getKey({
            key: redisServices.cacheKey({
                filter: email,
                subject: mailEnum.forgetPassword,
            }),
        }));
        if (!GlobalCompare({ plainText: otp, hashText: CachedOtp })) {
            ErrorUnAuthorizedRequest("wrong otp");
        }
        await redisServices.deleteKey({
            key: redisServices.cacheKey({
                filter: email,
                subject: mailEnum.forgetPassword,
            }),
        });
        await this._userModel.findOneAndUpdate({
            filter: { email, confirmed: true },
            update: {
                password: Globalhash({ plainText: newPassword }),
            },
        });
        SuccessResponse({ res, data: "password updated" });
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
