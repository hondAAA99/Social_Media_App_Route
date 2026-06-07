import z from 'zod'
import { blockUserSchema, handleFriendRequestSchema, lockProfileSchema, logoutSchema, removeFriendSchema, sendFriendRequestSchema, shareProfileSchema, updateEmailConfirmationSchema, updateEmailSchema, updatePasswordSchema, updateProfileSchema } from './user.Schema.js'

export type lockProfileDTO = z.infer<typeof lockProfileSchema.query>
export type shareProfileSchemaDTO = z.infer<typeof shareProfileSchema.params>
export type updateProfileSchemaDTO = z.infer<typeof updateProfileSchema.body>
export type updatePasswordSchemaDTO = z.infer<typeof updatePasswordSchema.body>
export type updateEmailSchemaDTO = z.infer<typeof updateEmailSchema.body>
export type updateEmailConfirmationSchemaDTO = z.infer<typeof updateEmailConfirmationSchema.body>
export type EnableTwoStepVerfictionDTO = z.infer<
  typeof logoutSchema.query
>
export type sendFriendRequestSchemaDTO = z.infer<typeof sendFriendRequestSchema.params>
export type handleFriendRequestSchemaDTO = z.infer<typeof handleFriendRequestSchema.params>
export type removeFriendSchemaDTO = z.infer<typeof removeFriendSchema.params>
export type blockUserSchemaDTO = z.infer<typeof blockUserSchema.params>