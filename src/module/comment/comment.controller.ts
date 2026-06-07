import { Router } from 'express'
import { authenticate } from '../../common/middleware/authenticate.js'
import commentServices from './comment.services.js'
import { fileUpload } from '../../common/middleware/multer.js'
import { validationMiddleWare } from '../../common/middleware/validation.js'
import {
  createComment,
  deleteComment,
  getCommentByIdAndPaginateReplies,
  getComments,
  hideComment,
  reactComment,
  updateComment,
} from './comment.validationSchema.js'
import { multerFileEnum } from '../../common/enum/file.base.enum.js'

const commentRouter: Router = Router()

commentRouter.post(
  '/',
  fileUpload({ fileType: multerFileEnum.image }).array('attachments'),
  validationMiddleWare(createComment),
  authenticate,
  commentServices.createComment,
)

commentRouter.get('/get-comments', authenticate, commentServices.getComments)
commentRouter.put(
  '/update-comment/:commentId',
  fileUpload({ fileType: multerFileEnum.image }).array('attachments'),
  validationMiddleWare(updateComment),
  authenticate,
  commentServices.updateComment,
)
commentRouter.delete(
  '/delete-comment/:commentId',
  validationMiddleWare(deleteComment),
  authenticate,
  commentServices.deleteComments,
)

commentRouter.get(
  '/get-comments/:postId',
  validationMiddleWare(getComments),
  authenticate,
  commentServices.getComments,
)
commentRouter.get(
  '/get-comment-by-id/:commentId',
  validationMiddleWare(getCommentByIdAndPaginateReplies),
  authenticate,
  commentServices.getCommentByIdAndPaginateReplies,
)
commentRouter.get(
  '/react-comment/:commentId',
  validationMiddleWare(reactComment),
  authenticate,
  commentServices.commentReact,
)

commentRouter.put(
  '/hide-comment/:commentId',
  validationMiddleWare(hideComment),
  authenticate,
  commentServices.hideComment,
)

export default commentRouter
