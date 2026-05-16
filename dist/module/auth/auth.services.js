import { ErrorConflict, Errorforbidden, ErrorInteralServerError, ErrorUnAuthorizedRequest, SuccessResponse, } from "../../common/utils/globalresponse.js";
import new userRepo() from "../../DB/repo/user.repo.js";
import { GlobalCompare, Globalhash } from "../../common/security/hash.js";
import { Globalencrypt } from "../../common/security/encrypt.js";
import { sendEmail } from "../../common/utils/email/sendEmail.js";
import mailEnum from "../../common/enum/mail.enum.js";
import { genrateOtp } from "../../common/utils/email/nodeMailer.js";
import { generateTokens } from "./services.helpers.js";
import redisServices from "../../common/services/redis.services.js";
import { O2AUTH_CLIENT_ID } from "../../config/config.services.js";
import { OAuth2Client } from "google-auth-library";
import providerEnum from "../../common/enum/provider.enum.js";
import fireBaseServices from "../../common/services/fireBase.services.js";
import cacheKeyEnum from "../../common/enum/cacheKey.enum.js";
class auth {
    _userModel = new userRepo();
    _fireBase = fireBaseServices;
    _redisServices = redisServices;
    constructor() { }
    signUp = async (req, res, next) => {
        const { userName, email, password, phone, gender } = req.body;
        const emailExists = await this._userModel.userEmailExists({ email });
        if (emailExists) {
            ErrorConflict("email already exists");
        }
        const user = await this._userModel.create({
            userName,
            email,
            password: Globalhash({ plainText: password }),
            phone: phone ? Globalencrypt({ plainText: phone }) : null,
            gender,
        });
        await sendEmail({
            to: email,
            subject: mailEnum.consrimSingUp,
            data: genrateOtp(),
        });
        SuccessResponse({ res, data: "please confirm your email" });
    };
    logIn = async (req, res, next) => {
        const { email, password, fcm } = req.body;
        const emailExists = await this._userModel.userEmailExists({ email, confirmed: true });
        if (!emailExists) {
            ErrorConflict("email doesn't exists");
        }
        if (!emailExists)
            ErrorConflict("email does not exists or confirmed");
        if (!GlobalCompare({ plainText: password, hashText: emailExists.password })) {
            Errorforbidden("wrong password");
        }
        let recorderedFcms = await this._redisServices.getSet({
            filter: email,
            subject: cacheKeyEnum.fcm,
        });
        if (!recorderedFcms) {
            await this._redisServices.addSet({
                filter: email,
                subject: cacheKeyEnum.fcm,
            }, fcm);
            this._fireBase.sendNotification({
                token: fcm,
                data: {
                    title: "login alert",
                    body: `new login at ${new Date(Date.now())}`,
                },
            });
        }
        else if (!recorderedFcms.includes(fcm)) {
            recorderedFcms.push(fcm);
            await this._redisServices.addSet({
                filter: email,
                subject: cacheKeyEnum.fcm,
            }, recorderedFcms);
            this._fireBase.sendNotifications({
                tokens: [...recorderedFcms, fcm],
                data: {
                    title: "login alert",
                    body: `new login at ${new Date(Date.now())}`,
                },
            });
        }
        else {
            this._fireBase.sendNotifications({
                tokens: recorderedFcms,
                data: {
                    title: "login alert",
                    body: `new login at ${new Date(Date.now())}`,
                },
            });
        }
        const { accessToken, refreshToken } = generateTokens(emailExists);
        SuccessResponse({ res, data: { accessToken, refreshToken } });
    };
    confirmMail = async (req, res, next) => {
        const { email, otp } = req.body;
        const emailExists = await this._userModel.userEmailExists({ email });
        if (emailExists) {
            ErrorConflict("email doesn't exists");
        }
        if (emailExists?.confirmed == true)
            ErrorConflict("your email is already confirmed");
        const CachedOtp = await this._redisServices.getKey({
            key: this._redisServices.cacheKey({
                filter: email,
                subject: mailEnum.consrimSingUp,
            }),
        });
        if (!GlobalCompare({ plainText: otp, hashText: CachedOtp }))
            Errorforbidden("wrong otp code");
        await this._redisServices.deleteKey({
            key: this._redisServices.cacheKey({
                filter: email,
                subject: mailEnum.consrimSingUp,
            }),
        });
        await this._userModel.findOneAndUpdate({
            filter: { email },
            update: { confirmed: true },
        });
        SuccessResponse({ res, data: "email confirmed" });
    };
    signUpAndLoginWithGmail = async (req, res, next) => {
        const { idToken } = req.body;
        const Client = new OAuth2Client(O2AUTH_CLIENT_ID);
        const verifyIdToken = Client.verifyIdToken({
            idToken,
            audience: O2AUTH_CLIENT_ID,
        });
        const payload = (await verifyIdToken).getPayload();
        if (!payload)
            ErrorInteralServerError("invalid token id");
        const { name, email, email_verified, picture } = payload;
        let emailExists = await this._userModel.userEmailExists({ email });
        if (!emailExists) {
            emailExists = await this._userModel.create({
                userName: name,
                email,
                provider: providerEnum.google,
                confirmed: email_verified,
            });
        }
        if (emailExists?.provider == providerEnum.system)
            ErrorConflict("please login throw system");
        const { accessToken, refreshToken } = generateTokens(emailExists);
        SuccessResponse({ res, data: { accessToken, refreshToken } });
    };
    reSendOtp = async (req, res, next) => {
        const { email } = req.body;
        const user = await this._userModel.findOne({ filter: email });
        if (!user) {
            ErrorConflict("user does not exists");
        }
        await sendEmail({
            to: email,
            subject: mailEnum.reSendOtp,
            data: genrateOtp(),
        });
        SuccessResponse({ res, data: "otp send please confirm your mail" });
    };
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
        const CachedOtp = (await this._redisServices.getKey({
            key: this._redisServices.cacheKey({
                filter: email,
                subject: mailEnum.forgetPassword,
            }),
        }));
        if (!GlobalCompare({ plainText: otp, hashText: CachedOtp })) {
            ErrorUnAuthorizedRequest("wrong otp");
        }
        await this._redisServices.deleteKey({
            key: this._redisServices.cacheKey({
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
    sendNotification = async (req, res, next) => {
        const { token } = req.body;
        const data = { title: "title test", body: "body test" };
        const result = fireBaseServices.sendNotification({ token, data });
        SuccessResponse({ res, data: result });
    };
}
export default new auth();
