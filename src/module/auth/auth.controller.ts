import auth from './auth.services.js'
import { Router } from 'express'
import {
  signUpSchema,
  signInSchema,
  confirmSignUpSchema,
  forgetPassword,
  resetPassowrd,
  confirmLoginSchema,
  EnableTwoStepVerfiction,
} from './auth.validationSchema.js'
import { validationMiddleWare } from '../../common/middleware/validation.js'

export const authRouter: Router = Router()

authRouter.post('/sign-up', validationMiddleWare(signUpSchema), auth.signUp)

authRouter.post('/log-in', validationMiddleWare(signInSchema), auth.logIn)

authRouter.get(
  '/enable-two-step-verfiction',
  validationMiddleWare(EnableTwoStepVerfiction),
  auth.EnableTwoStepVerfiction,
)

authRouter.post(
  '/confirm-Mail-And-Enable-Two-Step-Veffiction',
  validationMiddleWare(confirmSignUpSchema),
  auth.confirmMailAndEnableTwoStepVeffiction,
)

authRouter.post(
  '/confirm-login-in',
  validationMiddleWare(confirmLoginSchema),
  auth.confirmLogin,
)

authRouter.post(
  '/resend-otp',
  validationMiddleWare(resetPassowrd),
  auth.reSendOtp,
)

authRouter.post('/sign-with-google', auth.signUpAndLoginWithGmail)

authRouter.put(
  '/forget-password',
  validationMiddleWare(forgetPassword),
  auth.forgetPassword,
)

authRouter.patch(
  '/reset-password',
  validationMiddleWare(resetPassowrd),
  auth.resetPassowrd,
)
authRouter.get('/refresh-token', auth.generateAccessToken)
