import type { Request,Response,NextFunction } from "express"
import userRepo from "../../DB/repo/user.repo.js";
import {
  ErrorUnAuthorizedRequest,
  SuccessResponse,
} from "../../common/utils/globalresponse.js";
import redisServices from "../../common/services/redis.services.js";
import { GlobalCompare, Globalhash } from "../../common/security/hash.js";
import { HydratedDocument } from "mongoose";
import { IUser } from "../../DB/models/user.model.js";
import cacheKeyEnum from "../../common/enum/cacheKey.enum.js";
import s3services from "../../common/services/s3Services.js";
import { pipeline} from 'stream/promises'

class userServices {
  private readonly _userModel = new userRepo();

  constructor() {}

  updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } = req.body;
    const user: HydratedDocument<IUser> = req.user as HydratedDocument<IUser>;
    const hashOldPassword = user.password;
    if (!GlobalCompare({ plainText: oldPassword, hashText: hashOldPassword }))
      ErrorUnAuthorizedRequest("passwords does not match");

    await this._userModel.findOneAndUpdate({
      filter: { email: user.email, confirmed: true },
      update: { password: Globalhash({ plainText: newPassword }) },
    });

    SuccessResponse({ res, data: "password updated" });
  }

  logout = async (req: Request, res: Response, next: NextFunction) => {
    const {flag} = req.query;
    const user : HydratedDocument<IUser> = req.user as HydratedDocument<IUser>
    if (flag == 'all'){
      user.creadnatials = new Date(Date.now());
      user.save();
      // await redisServices.deleteKey({
      //   key : redisServices.cacheKey({filter : user.email , subject : cacheKeyEnum.revokeToken})
      // })
      // SuccessResponse({res ,data : "logout succeded from all devices"})
    }
    await redisServices.setKey({
      key : redisServices.cacheKey({filter : req.token as string , subject : cacheKeyEnum.revokeToken }),
      value : user.email,
      ttl :  (Date.now() - req.tokenDecoded.iat!*1000)
    })
    SuccessResponse({res ,data : "logout succeded"})
  }

  // uploadFile = async(req: Request, res: Response, next: NextFunction)=>{}

  // uploadLargeFile = async(req: Request, res: Response, next: NextFunction)=>{}

  // uploadFiles = async(req: Request, res: Response, next: NextFunction)=>{}

  uploadBySignedUrl = async(req: Request, res: Response, next: NextFunction)=>{
    const { fileName , ContentType } : { fileName : string , ContentType : string } = req.body
    const { Key , url } = await s3services.createSignedUrl({
      fileName,
      path : 'users',
      ContentType
    })

    req.user!.profilePicture = url 
    await req.user!.save()

    SuccessResponse({res,data : { Key , url }})
  }

  getFile = async(req: Request, res: Response, next: NextFunction)=>{
    const { path } = req.params as { path : string[] }
    const { download } = req.query as { download : string }
    const Key = path.join('/');
    const result = await s3services.getFile(Key) ;
    const stream = result.Body as NodeJS.ReadableStream;
    res.setHeader('Content-Type',result.ContentType!)
    res.setHeader('Cross-Origin-Resourse-Policy','cross-origin')
    if (download === 'true' ) res.setHeader('Content-Disposition',`attachment ; filename-="${path.pop()}"`)
    res.setHeader('Content-Type',result.ContentType!)

    await pipeline(stream,res)
  }

  getSignedUrl = async(req: Request, res: Response, next: NextFunction)=>{
    const { path } = req.params as { path : string[] }
    const { download } = req.query
    const Key = path.join('/');
    const url = await s3services.getSignedUrl({Key,download : download == undefined ? false : true })

    SuccessResponse({res,data : url })

  }

  deleteFile = async(req: Request, res: Response, next: NextFunction)=>{
    const { Key } = req.query as { Key : string }
    const result = await s3services.deleteFile({Key})

    SuccessResponse({res, data : result })

  }

  deleteFiles = async(req: Request, res: Response, next: NextFunction)=>{
    const { Keys } = req.body as { Keys : string[] }
    const result = await s3services.deleteFiles({Keys})

    SuccessResponse({res,data : result })

  }

  deleteFolder = async(req: Request, res: Response, next: NextFunction)=>{
    const { folderKey } = req.body as { folderKey : string }
    const result = await s3services.deleteFolder({folderKey})
    SuccessResponse({res,data : result })

  }


}

export default new userServices() ;