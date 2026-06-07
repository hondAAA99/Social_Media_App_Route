import z from 'zod'
import {
  confirmSignUpSchema,
  resendOtp,
  signInSchema,
  signUpSchema,
  confirmLoginSchema,
  resetPassword,
  sendOtp,
} from './auth.validationSchema.js'

export type signUpDTO = z.infer<typeof signUpSchema.body>
export type lobInDTO = z.infer<typeof signInSchema.body>
export type confirmEmailDTOBody = z.infer<typeof confirmSignUpSchema.body>
export type confirmEmailDTOParams = z.infer<typeof confirmSignUpSchema.params>
export type sendOtpDTO = z.infer<typeof sendOtp.body>
export type resetPasswordDTO = z.infer<typeof resetPassword.body>
export type resendOtpDTOBody = z.infer<typeof resendOtp.body>
export type resendOtpDTOParams = z.infer<typeof resendOtp.params>

export type confirmLoginSchema = z.infer<typeof confirmLoginSchema.body>
