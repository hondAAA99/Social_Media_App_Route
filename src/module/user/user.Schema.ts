import zod from 'zod'
import { genRules } from '../../common/utils/validationGeneralRules.js'

export const updatePasswordSchema = {
  body: zod.object({
    email: genRules.shape.email,
    oldPassword: zod.string(),
    passwordSchema: genRules.shape.passwordSchema,
  }),
}
export const lockProfileSchema = {
  query: zod.object({
    flag: genRules.shape.lockProfileFlag,
  }),
}
export const updateEmailSchema = {
  body: zod.object({
    email: genRules.shape.email,
  }),
}
export const shareProfileSchema = {
  params: zod.object({
    userId: genRules.shape.id,
  }),
}
export const updateProfileSchema = {
  body: zod.object({
    firstName: genRules.shape.firstName,
    lastName: genRules.shape.lastName,
    age: genRules.shape.age,
    gender: genRules.shape.gender,
    phone: genRules.shape.phone,
    file: genRules.shape.file,
  }),
}
export const updateEmailConfirmationSchema = {
  body: zod.object({
    newEmail: genRules.shape.email,
    otp: genRules.shape.otp,
  }),
}
export const logoutSchema = {
  query: zod.object({
    flag: zod.string().optional(),
  }),
}
export const sendFriendRequestSchema = {
  params: zod.object({
    requestedUserId: genRules.shape.id,
  }),
}

export const handleFriendRequestSchema = {
  params: zod.object({
    requestingUserId: genRules.shape.id,
    flag: genRules.shape.friendRequestFlag,
  }),
}
export const removeFriendSchema = {
  params: zod.object({
    removedFriendId: genRules.shape.id,
  }),
}
export const blockUserSchema = {
  query: zod.object({
    blockedUserId: genRules.shape.id,
    flag: genRules.shape.blockUserFlag,
  }),
}
