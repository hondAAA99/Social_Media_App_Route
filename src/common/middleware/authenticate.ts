import type { NextFunction, Request, Response } from "express";
import {
  SECRET_ADMIN_ACCESS_TOKEN,
  SECRET_USER_ACCESS_TOKEN,
  TOKEN_ADMIN_PREFIX,
  TOKEN_USER_PREFIX,
} from "../../config/config.services.js";
import {
  ErrorConflict,
  Errorforbidden,
  ErrorUnAuthorizedRequest,
} from "../utils/globalresponse.js";
import { accessTokenVerify } from "../security/jsonWebTokens.js";
import jsonwebtoken, { decode } from "jsonwebtoken";
import userRepo from "../../DB/repo/user.repo.js";
import { HydratedDocument } from "mongoose";
import { IUser } from "../../DB/models/user.model.js";
import cacheKeyEnum from "../enum/cacheKey.enum.js";
import redisServices from "../services/redis.services.js";
import authenticateUtilts from "../utils/authentication.utils.js";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let { authorization }: any = req.headers;

  const { user, token, decoded } = await authenticateUtilts(authorization);
  req.user = user as HydratedDocument<IUser>;
  req.token = token as string;
  req.tokenDecoded = decoded;
  next();
}

export async function authenticateGQL(context: any) {
  let { authorization } = context.req.headers;

  const { user, token, decoded } = await authenticateUtilts(authorization);
  return {
    user,
    token,
    decoded,
  };
}
