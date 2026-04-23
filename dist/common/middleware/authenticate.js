import { TOKEN_USER_PREFIX } from "../../config/config.services.js";
import { ErrorConflict, Errorforbidden, ErrorUnAuthorizedRequest } from "../utils/globalresponse.js";
import { accessTokenVerify } from "../security/jsonWebTokens.js";
import userRepo from "../../DB/repo/user.repo.js";
import redisServices from "../../DB/Redis/redis.services.js";
import cacheKeyEnum from "../enum/cacheKey.enum.js";
export async function authenticate(req, res, next) {
    let authorization = req.headers.authorization;
    let [prefix, token] = authorization.split(" ");
    if (prefix != TOKEN_USER_PREFIX)
        Errorforbidden('invalid token');
    const verify = accessTokenVerify(token);
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
