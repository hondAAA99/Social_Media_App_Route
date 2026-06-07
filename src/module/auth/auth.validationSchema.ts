import zod from 'zod'
import { genRules } from '../../common/utils/validationGeneralRules.js'
import {
  confirmEmailFlagEnum,
  roleEnum,
} from '../../common/enum/user.base.enum.js'
import mailEnum from '../../common/enum/mail.enum.js'
export const signUpSchema = {
  body: zod
    .object({
      userName: zod.string(),
      email: zod.email(),
      passwordSchema: genRules.shape.passwordScheam,
      phone: genRules.shape.phone.shape.data.optional(),
      role: zod.enum(Object.values(roleEnum)).optional(),
      gender: genRules.shape.gender.shape.data.optional(),
      BirthDate: zod.date().optional(),
    })
    .superRefine((data, ctx) => {
      // if (data.password != data.cpassword) {
      //   ctx.addIssue({
      //     code: zod.z.ZodIssueCode.custom,
      //     message: 'passwords do not match',
      //     path: ['cpassword'],
      //   })
      // }
      if (
        data.BirthDate &&
        Number(new Date(data.BirthDate).getTime()) < Date.now()
      ) {
        ctx.addIssue({
          code: zod.z.ZodIssueCode.custom,
          message: 'invalid Date',
          path: ['BirthDate'],
        })
      }
    }),
}

export const signInSchema = {
  body: zod.object({
    email: zod.email(),
    password: zod.string(),
    fcm: zod.string(),
  }),
}

export const confirmSignUpSchema = {
  body: zod.object({
    email: zod.email(),
    otp: genRules.shape.otp,
  }),
  params: zod.object({
    flag: zod.enum(Object.values(confirmEmailFlagEnum)),
  }),
}

export const sendOtp = {
  body: zod.object({
    email: zod.email(),
  }),
  params: zod.object({
    flag: zod.enum(Object.values(mailEnum)),
  }),
}

export const resetPassword = {
  body: zod.object({
    email: zod.email(),
    password: genRules.shape.password,
    cPassword: zod.string(),
    otp: genRules.shape.otp,
  }),
}

export const resendOtp = {
  body: zod.object({
    email: zod.email(),
  }),
  params: zod.object({
    flag: zod.enum(Object.values(mailEnum)),
  }),
}

export const confirmLoginSchema = {
  body: zod.object({
    email: zod.email(),
    otp: genRules.shape.otp,
  }),
}
