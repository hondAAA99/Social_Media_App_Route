import { HydratedDocument } from "mongoose";
import {
  SECRET_ADMIN_ACCESS_TOKEN,
  SECRET_USER_ACCESS_TOKEN,
  TOKEN_ADMIN_PREFIX,
  TOKEN_USER_PREFIX,
} from "../../config/config.services.js";
import { accessTokenVerify } from "../security/jsonWebTokens.js";
import {
  ErrorConflict,
  Errorforbidden,
  ErrorUnAuthorizedRequest,
} from "./globalresponse.js";
import jsonwebtoken from "jsonwebtoken";
import userRepo from "../../DB/repo/user.repo.js";
import redisServices from "../services/redis.services.js";
import { IUser } from "../../DB/models/user.model.js";
import cacheKeyEnum from "../enum/cacheKey.enum.js";

async function authenticateUtilts(authorization: string) {
  let [prefix, token] = authorization.split(" ") as [string, string];
  if (!prefix) {
    Errorforbidden("invalid token");
  }

  const secret: string = (function () {
    if (prefix == TOKEN_USER_PREFIX) {
      return SECRET_ADMIN_ACCESS_TOKEN;
    } else if (prefix == TOKEN_ADMIN_PREFIX) {
      return SECRET_USER_ACCESS_TOKEN;
    }
    return Errorforbidden("invalid token");
  })();

  const verify: jsonwebtoken.JwtPayload = accessTokenVerify({
    token,
    secret,
  }) as jsonwebtoken.JwtPayload;
  const user: HydratedDocument<IUser> | null = await new userRepo().findById({
    id: verify.data.userId,
  });
  if (!user) ErrorConflict("user does not exists");
  if (
    user!.creadnatials &&
    user!.creadnatials.getTime() < (verify.iat as number) * 1000
  )
    ErrorUnAuthorizedRequest("token revoked please login again");

  const CachedRevokeToken = await new redisServices().getKey({
    key: new redisServices().cacheKey({
      filter: token,
      subject: cacheKeyEnum.revokeToken,
    }),
  });

  if (CachedRevokeToken)
    ErrorUnAuthorizedRequest("token revoked please login again");

  return { user, token, decoded: verify };
}

export default authenticateUtilts
