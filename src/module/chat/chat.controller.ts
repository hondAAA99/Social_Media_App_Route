import { Router } from 'express'
import { authenticate } from '../../common/middleware/authenticate.js'
import chatServices from './chat.service.js'
import { getChatSchema } from './chat.schema.js'
import { validationMiddleWare } from '../../common/middleware/validation.js'

const chatRouter: Router = Router()

chatRouter.get(
  '/',
  validationMiddleWare(getChatSchema),
  authenticate,
  chatServices.getChat,
)

export default chatRouter
