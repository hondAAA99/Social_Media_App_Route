  import type { NextFunction, Request, Response } from "express";
  import { TOKEN_PREFIX } from "../../config/config.services.js";
  import { ErrorConflict, Errorforbidden, ErrorUnAuthorizedRequest } from "../utils/globalresponse.js";
  import { accessTokenVerify } from "../security/jsonWebTokens.js";
  import jsonwebtoken from "jsonwebtoken";
  import userRepo from "../../DB/repo/user.repo.js";
  import { HydratedDocument } from "mongoose";
  import { IUser } from "../../DB/models/user.model.js";
import redisServices from "../../DB/Redis/redis.services.js";
import cacheKeyEnum from "../enum/cacheKey.enum.js";



  export async function authenticate(req : Request,res:Response,next : NextFunction){
    let authorization :any = req.headers.authorization 

    let [prefix, token] : [string,string] = authorization.split(" ");
    if (prefix != TOKEN_PREFIX) Errorforbidden('invalid token')
    
    const verify: jsonwebtoken.JwtPayload = accessTokenVerify(
      token,
    ) as jsonwebtoken.JwtPayload;

    const user : HydratedDocument<IUser> | null = await new userRepo().findById({
      id : verify.userId ,
    })
    if (!user) ErrorConflict('user does not exists')
    if (user!.creadnatials && user!.creadnatials.getTime() < (verify.iat as number)*1000) 
    ErrorUnAuthorizedRequest('token revoked please login again')

    const CachedRevokeToken = await redisServices.getKey({
      key : redisServices.cacheKey({filter : token , subject : cacheKeyEnum.revokeToken})
    })

    if (CachedRevokeToken) ErrorUnAuthorizedRequest('token revoked please login again')
      
    req.user = user as HydratedDocument<IUser>;
    req.token = token as string ;
    next();
  }
