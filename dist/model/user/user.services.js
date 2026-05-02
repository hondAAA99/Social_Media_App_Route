import userRepo from "../../DB/repo/user.repo.js";
import { ErrorUnAuthorizedRequest, SuccessResponse, } from "../../common/utils/globalresponse.js";
import redisServices from "../../common/services/redis.services.js";
import { GlobalCompare, Globalhash } from "../../common/security/hash.js";
import cacheKeyEnum from "../../common/enum/cacheKey.enum.js";
import s3services from "../../common/services/s3Services.js";
import { pipeline } from 'stream/promises';
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
    uploadBySignedUrl = async (req, res, next) => {
        const { fileName, ContentType } = req.body;
        const { Key, url } = await s3services.createSignedUrl({
            fileName,
            path: 'users',
            ContentType
        });
        req.user.profilePicture = url;
        await req.user.save();
        SuccessResponse({ res, data: { Key, url } });
    };
    getFile = async (req, res, next) => {
        const { path } = req.params;
        const { download } = req.query;
        const Key = path.join('/');
        const result = await s3services.getFile(Key);
        const stream = result.Body;
        res.setHeader('Content-Type', result.ContentType);
        res.setHeader('Cross-Origin-Resourse-Policy', 'cross-origin');
        if (download === 'true')
            res.setHeader('Content-Disposition', `attachment ; filename-="${path.pop()}"`);
        res.setHeader('Content-Type', result.ContentType);
        await pipeline(stream, res);
    };
    getSignedUrl = async (req, res, next) => {
        const { path } = req.params;
        const { download } = req.query;
        const Key = path.join('/');
        const url = await s3services.getSignedUrl({ Key, download: download == undefined ? false : true });
        SuccessResponse({ res, data: url });
    };
    deleteFile = async (req, res, next) => {
        const { Key } = req.query;
        const result = await s3services.deleteFile({ Key });
        SuccessResponse({ res, data: result });
    };
    deleteFiles = async (req, res, next) => {
        const { Keys } = req.body;
        const result = await s3services.deleteFiles({ Keys });
        SuccessResponse({ res, data: result });
    };
    deleteFolder = async (req, res, next) => {
        const { folderKey } = req.body;
        const result = await s3services.deleteFolder({ folderKey });
        SuccessResponse({ res, data: result });
    };
}
export default new userServices();
