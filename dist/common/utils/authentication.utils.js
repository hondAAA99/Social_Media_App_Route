import { SECRET_ADMIN_ACCESS_TOKEN, SECRET_USER_ACCESS_TOKEN, TOKEN_ADMIN_PREFIX, TOKEN_USER_PREFIX, } from "../../config/config.services.js";
import { accessTokenVerify } from "../security/jsonWebTokens.js";
import { ErrorConflict, Errorforbidden, } from "./globalresponse.js";
import userRepo from "../../DB/repo/user.repo.js";
async function authenticateUtilts(authorization) {
    let [prefix, token] = authorization.split(" ");
    if (!prefix) {
        Errorforbidden("invalid token");
    }
    const secret = (function () {
        if (prefix == TOKEN_USER_PREFIX) {
            return SECRET_USER_ACCESS_TOKEN;
        }
        else if (prefix == TOKEN_ADMIN_PREFIX) {
            return SECRET_ADMIN_ACCESS_TOKEN;
        }
        return Errorforbidden("invalid token");
    })();
    const verify = accessTokenVerify({
        token,
        secret,
    });
    const user = await new userRepo().findById({
        id: verify.userId,
    });
    if (!user)
        ErrorConflict("user does not exists");
    return { user, token, decoded: verify };
}
export default authenticateUtilts;
