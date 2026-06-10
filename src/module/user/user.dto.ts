import z from 'zod'
import {
  blockUserSchema,
  handleFriendRequestSchema,
  lockProfileSchema,
  logoutSchema,
  removeFriendSchema,
  sendFriendRequestSchema,
  shareProfileSchema,
  updateEmailConfirmationSchema,
  updateEmailSchema,
  updatePasswordSchema,
  updateProfileSchema,
} from './user.Schema.js'

export type lockProfileDTO = Partial<z.infer<typeof lockProfileSchema.query>>
export type shareProfileSchemaDTO = Partial<
  z.infer<typeof shareProfileSchema.params>
>
export type updateProfileSchemaDTO = Partial<
  z.infer<typeof updateProfileSchema.body>
>
export type updatePasswordSchemaDTO = z.infer<typeof updatePasswordSchema.body>

export type updateEmailSchemaDTO = z.infer<typeof updateEmailSchema.body>

export type updateEmailConfirmationSchemaDTO = Partial<
  z.infer<typeof updateEmailConfirmationSchema.body>
>
export type EnableTwoStepVerfictionDTO = Partial<
  z.infer<typeof logoutSchema.query>
>
export type sendFriendRequestSchemaDTO = Partial<
  z.infer<typeof sendFriendRequestSchema.params>
>
export type handleFriendRequestSchemaDTO = Partial<
  z.infer<typeof handleFriendRequestSchema.params>
>
export type removeFriendSchemaDTO = Partial<
  z.infer<typeof removeFriendSchema.params>
>
export type blockUserSchemaDTO = z.infer<typeof blockUserSchema.query>
