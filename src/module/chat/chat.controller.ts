import { Router } from 'express'
import { authenticate } from '../../common/middleware/authenticate.js'
import chatServices from './chat.service.js'
import { createGroupChat, getChatSchema } from './chat.schema.js'
import { validationMiddleWare } from '../../common/middleware/validation.js'
import { fileUpload } from '../../common/middleware/multer.js'
import { multerFileEnum } from '../../common/enum/file.base.enum.js'

const chatRouter: Router = Router()

chatRouter.get(
  '/',
  validationMiddleWare(getChatSchema),
  authenticate,
  chatServices.getChat,
)

chatRouter.post(
  '/create-group',
  fileUpload({ fileType: multerFileEnum.image }).single('groupImage'),
  validationMiddleWare(createGroupChat),
)

chatRouter.get('/get-group-chat',)

export default chatRouter
