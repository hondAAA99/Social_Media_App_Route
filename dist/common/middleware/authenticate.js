import { SECRET_ADMIN_ACCESS_TOKEN, SECRET_USER_ACCESS_TOKEN, TOKEN_ADMIN_PREFIX, TOKEN_USER_PREFIX } from "../../config/config.services.js";
import { ErrorConflict, Errorforbidden, ErrorUnAuthorizedRequest } from "../utils/globalresponse.js";
import { accessTokenVerify } from "../security/jsonWebTokens.js";
import userRepo from "../../DB/repo/user.repo.js";
import cacheKeyEnum from "../enum/cacheKey.enum.js";
import redisServices from "../services/redis.services.js";
export async function authenticate(req, res, next) {
    let { authorization } = req.headers;
    let [prefix, token] = authorization.split(" ");
    if (!prefix) {
        Errorforbidden('invalid token');
    }
    const secret = (function () {
        if (prefix == TOKEN_USER_PREFIX) {
            return SECRET_ADMIN_ACCESS_TOKEN;
        }
        else if (prefix == TOKEN_ADMIN_PREFIX) {
            return SECRET_USER_ACCESS_TOKEN;
        }
        return Errorforbidden('invalid token');
    })();
    const verify = accessTokenVerify({ token, secret });
    const user = await new userRepo().findById({
        id: verify.data.userId,
    });
    if (!user)
        ErrorConflict('user does not exists');
    if (user.creadnatials && user.creadnatials.getTime() < verify.iat * 1000)
        ErrorUnAuthorizedRequest('token revoked please login again');
    const CachedRevokeToken = await redisServices.getKey({
        key: redisServices.cacheKey({ filter: token, subject: cacheKeyEnum.revokeToken })
    });
    if (CachedRevokeToken)
        ErrorUnAuthorizedRequest('token revoked please login again');
    req.user = user;
    req.token = token;
    req.tokenDecoded = verify;
    next();
}
