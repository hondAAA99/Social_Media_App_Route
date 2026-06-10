import { Router } from 'express'
import { authenticate } from '../../common/middleware/authenticate.js'
import userServices from './user.services.js'
import {
  blockUserSchema,
  handleFriendRequestSchema,
  lockProfileSchema,
  logoutSchema,
  removeFriendSchema,
  sendFriendRequestSchema,
  shareProfileSchema,
  updateEmailConfirmationSchema,
  updatePasswordSchema,
  updateProfileSchema,
} from './user.Schema.js'
import { validationMiddleWare } from '../../common/middleware/validation.js'
import chatRouter from '../chat/chat.controller.js'
import { fileUpload } from '../../common/middleware/multer.js'
import { multerFileEnum } from '../../common/enum/file.base.enum.js'

export const userRouter: Router = Router({ mergeParams: true })

userRouter.use('/:userId/chat', chatRouter)

userRouter.patch(
  '/update-password',
  validationMiddleWare(updatePasswordSchema),
  authenticate,
  userServices.updatePassword,
)
userRouter.put('/update-email', authenticate, userServices.updateEmail)

userRouter.get('/update-email-confirmation', authenticate, userServices.updateEmailconfirmation)

userRouter.get('/get-profile', authenticate, userServices.getUserProfile)

userRouter.get(
  '/share-user/:userId',
  validationMiddleWare(shareProfileSchema),
  authenticate,
  userServices.ShareProfile,
)
userRouter.put(
  '/update-profile',
  fileUpload({ fileType: multerFileEnum.image }).single('file'),
  validationMiddleWare(updateProfileSchema),
  authenticate,
  userServices.updateProfile,
)
userRouter.delete('/delete-user', authenticate, userServices.deleteUser)

userRouter.get(
  '/log-out',
  validationMiddleWare(logoutSchema),
  authenticate,
  userServices.logout,
)

userRouter.get(
  '/lock-profile',
  validationMiddleWare(lockProfileSchema),
  authenticate,
  userServices.lockProfile,
)

userRouter.post(
  '/sendFriendRequest/:requestedUserId',
  validationMiddleWare(sendFriendRequestSchema),
  authenticate,
  userServices.sendFriendRequest,
)
userRouter.post(
  '/handleFriendRequest/:requestingUserId',
  validationMiddleWare(handleFriendRequestSchema),
  authenticate,
  userServices.handleFriendRequest,
)
userRouter.delete(
  '/removeFriend/:friendId',
  validationMiddleWare(removeFriendSchema),
  authenticate,
  userServices.removeFriend,
)
userRouter.post(
  '/blockUser/:userId',
  validationMiddleWare(blockUserSchema),
  authenticate,
  userServices.blockHandling,
)
