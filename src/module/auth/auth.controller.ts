import auth from './auth.services.js'
import { Router } from 'express'
import {
  signUpSchema,
  signInSchema,
  confirmSignUpSchema,
  resetPassword,
  confirmLoginSchema,
  resendOtp,
  sendOtp,
} from './auth.validationSchema.js'
import { validationMiddleWare } from '../../common/middleware/validation.js'

export const authRouter: Router = Router()

authRouter.post('/sign-up', validationMiddleWare(signUpSchema), auth.signUp)

authRouter.post('/log-in', validationMiddleWare(signInSchema), auth.logIn)

authRouter.post(
  '/confirm-mail',
  // validationMiddleWare(confirmSignUpSchema),
  auth.confirmMail,
)

authRouter.post(
  '/confirm-login-in',
  validationMiddleWare(confirmLoginSchema),
  auth.confirmLogin,
)

authRouter.get(
  '/resend-otp',
  // validationMiddleWare(resendOtp),
  auth.reSendOtp,
)

authRouter.post('/sign-with-google', auth.signUpAndLoginWithGmail)

authRouter.patch(
  '/reset-password',
  validationMiddleWare(resetPassword),
  auth.resetPassword,
)
authRouter.get(
  '/access-token',
  validationMiddleWare(resetPassword),
  auth.generateAccessToken,
)
authRouter.get('/refresh-token', auth.generateAccessToken)
