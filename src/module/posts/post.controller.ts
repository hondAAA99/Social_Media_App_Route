import {  Router } from "express";
import { fileUpload } from "../../common/middleware/multer.js";
import multerFileEnum from "../../common/enum/multerFileType.js";
import multerStorageEnum from "../../common/enum/multerStorageType.js";
import { validationMiddleWare } from "../../common/middleware/validation.js";
import { createPostSchema } from "./post.schema.js";
import postServices from "./post.services.js";


const postController : Router = Router()


postController.post('/create-post',
   fileUpload({fileType : multerFileEnum.image}).array('attachments'),
   validationMiddleWare(createPostSchema),
   postServices.createPost
)


export default postController;