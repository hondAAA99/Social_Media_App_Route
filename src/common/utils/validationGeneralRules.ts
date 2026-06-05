import { Types } from 'mongoose'
import zod from 'zod'
import availabiltyEnum from '../enum/availablity.enum.js'

export const genRules = {
  email: zod.email(),
  firstName: zod.string().min(2).max(100).optional(),
  lastName: zod.string().min(2).max(100).optional(),
  age: zod
    .object({
      data: zod.number().optional(),
      availibilty: zod.enum(Object.values(availabiltyEnum)).optional(),
    })
    .optional(),
  gender: zod
    .object({
      data: zod.string().optional(),
      availibilty: zod.enum(Object.values(availabiltyEnum)).optional(),
    })
    .optional(),
  phone: zod
    .object({
      data: zod.string().optional(),
      availibilty: zod.enum(Object.values(availabiltyEnum)).optional(),
    })
    .optional(),
  friends: zod
    .object({
      availibilty: zod.enum(Object.values(availabiltyEnum)).optional(),
    })
    .optional(),
  otp: zod.string().length(5),
  id: zod.string().refine(
    value => {
      return Types.ObjectId.isValid(value)
    },
    { message: 'inValid id' },
  ),
  file: zod.object({
    feildname: zod.string(),
    originalname: zod.string(),
    encoding: zod.string(),
    mimeType: zod.string(),
    buffer: zod.any().optional(),
    path: zod.string().optional(),
    size: zod.number(),
  }),
}
