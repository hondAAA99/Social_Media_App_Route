import { Router } from 'express'
import { fileUpload } from '../../common/middleware/multer.js'
import { validationMiddleWare } from '../../common/middleware/validation.js'
import {
  createPostSchema,
  deletePostSchema,
  likePostSchema,
  updatePostSchema,
} from './post.schema.js'
import postServices from './post.services.js'
import { authenticate } from '../../common/middleware/authenticate.js'
import commentRouter from '../comment/comment.controller.js'
import { multerFileEnum } from '../../common/enum/file.base.enum.js'

const postRouter: Router = Router()

postRouter.use('/:postId/comments{/commentReplay/:commentId}', commentRouter)

postRouter.post(
  '/create-post',
  fileUpload({ fileType: multerFileEnum.image }).array('attachments'),
  validationMiddleWare(createPostSchema),
  authenticate,
  postServices.createPost,
)

postRouter.get('/get-posts', authenticate, postServices.getPosts)

postRouter.get(
  '/like-post/:postId',
  validationMiddleWare(likePostSchema),
  authenticate,
  postServices.reactPost,
)

postRouter.patch(
  '/update-post/:postId',
  fileUpload({ fileType: multerFileEnum.image }).array('attachments'),
  validationMiddleWare(updatePostSchema),
  authenticate,
  postServices.updatePost,
)

postRouter.delete(
  '/delete-post/:postId',
  fileUpload({ fileType: multerFileEnum.image }).array('attachments'),
  validationMiddleWare(deletePostSchema),
  authenticate,
  postServices.deletePost,
)
export default postRouter
