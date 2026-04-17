import { ErrorConflict, Errorforbidden, ErrorInteralServerError, SuccessResponse, } from "../../common/utils/globalresponse.js";
import userRepo from "../../DB/repo/user.repo.js";
import { GlobalCompare, Globalhash } from "../../common/security/hash.js";
import { Globalencrypt } from "../../common/security/encrypt.js";
import { sendEmail } from "../../common/utils/email/sendEmail.js";
import mailEnum from "../../common/enum/mail.enum.js";
import { genrateOtp } from "../../common/utils/email/nodeMailer.js";
import { generateTokens } from "./services.helpers.js";
import redisServices from "../../DB/Redis/redis.services.js";
import { O2AUTH_CLIENT_ID } from "../../config/config.services.js";
import { OAuth2Client } from "google-auth-library";
import providerEnum from "../../common/enum/provider.enum.js";
class auth {
    _userModel = new userRepo();
    constructor() { }
    signUp = async (req, res, next) => {
        const { userName, email, password, phone, gender, role, } = req.body;
        const emailExists = await this._userModel.userEmailExists(email);
        if (emailExists) {
            ErrorConflict("email already exists");
        }
        const user = await this._userModel.create({
            userName,
            email,
            password: Globalhash({ plainText: password }),
            phone: phone ? Globalencrypt({ plainText: phone }) : null,
            gender,
            role,
        });
        await sendEmail({
            to: email,
            subject: mailEnum.consrimSingUp,
            data: genrateOtp(),
        });
        SuccessResponse({ res, data: "please confirm your email" });
    };
    logIn = async (req, res, next) => {
        const { email, password } = req.body;
        const user = await this._userModel.findOne({
            filter: {
                email,
                confirmed: true,
            },
        });
        if (!user)
            ErrorConflict("email does not exists or confirmed");
        if (!GlobalCompare({ plainText: password, hashText: user.password })) {
            Errorforbidden("wrong password");
        }
        const { accessToken, refreshToken } = generateTokens(user);
        SuccessResponse({ res, data: { accessToken, refreshToken } });
    };
    confirmMail = async (req, res, next) => {
        const { email, otp } = req.body;
        const emailExists = await this._userModel.userEmailExists(email);
        if (!emailExists) {
            ErrorConflict("email doesn't exists");
        }
        const CachedOtp = await redisServices.getKey({
            key: redisServices.cacheKey({
                filter: email,
                subject: mailEnum.consrimSingUp,
            }),
        });
        console.log(CachedOtp);
        if (!GlobalCompare({ plainText: otp, hashText: CachedOtp }))
            Errorforbidden("wrong otp code");
        const user = await this._userModel.findOneAndUpdate({
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
        let emailExists = await this._userModel.userEmailExists(email);
        if (!emailExists) {
            emailExists = await this._userModel.create({
                userName: name,
                email,
                provider: providerEnum.google,
                confirmed: email_verified,
            });
        }
        if (emailExists?.provider == providerEnum.sysyem)
            ErrorConflict("please login throw system");
        const { accessToken, refreshToken } = generateTokens(emailExists);
        SuccessResponse({ res, data: { accessToken, refreshToken } });
    };
}
export default new auth();
