import { SECRET_ADMIN_ACCESS_TOKEN, SECRET_USER_ACCESS_TOKEN, TOKEN_ADMIN_PREFIX, TOKEN_USER_PREFIX, } from '../../config/config.services.js';
import { TokenVerify } from '../security/jsonWebTokens.js';
import { ErrorConflict, Errorforbidden, ErrorUnAuthorizedRequest, } from './globalresponse.js';
import userRepo from '../../DB/repo/user.repo.js';
import redisService from '../services/redis.services.js';
import cacheKeyEnum from '../enum/redis.base.enum.js';
async function authenticateUtilts(authorization) {
    let [prefix, token] = authorization.split(' ');
    if (!prefix) {
        Errorforbidden('invalid token*1');
    }
    const secret = (function () {
        if (prefix == TOKEN_USER_PREFIX) {
            return SECRET_USER_ACCESS_TOKEN;
        }
        else if (prefix == TOKEN_ADMIN_PREFIX) {
            return SECRET_ADMIN_ACCESS_TOKEN;
        }
        return Errorforbidden('invalid token*2');
    })();
    const verify = TokenVerify({
        token: token,
        secret,
    });
    const user = await new userRepo().findById({
        id: verify.userId,
    });
    if (!user)
        ErrorConflict('user does not exists');
    if (user.credentials &&
        user.credentials.getTime() < verify.iat * 1000) {
        console.log({ 1: user.credentials, 2: user.credentials.getTime() });
        ErrorUnAuthorizedRequest('token revoked please login again');
    }
    const CachedRevokeToken = await new redisService().getKey({
        key: new redisService().cacheKey({
            filter: token,
            subject: cacheKeyEnum.revokeToken,
        }),
    });
    if (CachedRevokeToken)
        ErrorUnAuthorizedRequest('token revoked please login again');
    return { user, token, decoded: verify };
}
export default authenticateUtilts;
