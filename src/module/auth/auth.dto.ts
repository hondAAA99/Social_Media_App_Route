import z from "zod";
import {
  confirmSignUpSchema,
  forgetPassword,
  resendOtp,
  resetPassowrd,
  signInSchema,
  signUpSchema,
} from "./auth.validationSchema.js";

export type signUpDTO = z.infer<typeof signUpSchema.body>;
export type lobInDTO = z.infer<typeof signInSchema.body>;
export type confirmEmailDTO = z.infer<typeof confirmSignUpSchema.body>;
export type forgetPasswordDTO = z.infer<typeof forgetPassword.body>;
export type resetPasswordDTO = z.infer<typeof resetPassowrd.body>;
export type resendOtpDTO = z.infer<typeof resendOtp.body>;
