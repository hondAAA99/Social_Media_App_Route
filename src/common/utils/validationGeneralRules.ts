import { Types } from 'mongoose'
import zod from 'zod'
import availabiltyEnum from '../enum/availablity.enum.js'

export const genRules = {
  email: zod.email(),
  firstName: zod.string().min(2).max(100).optional().refine(value => value?.length>2 &&, { message: 'firstName should not contain spaces' }),
  lastName: zod.string().min(2).max(100).optional().refine(value => , { message: 'lastName should not contain spaces' }),
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
    }).refine(obj => {
      const allowedGenders = ['male', ' female', 'other']
      return obj.data === undefined || allowedGenders.includes(obj.data.toLowerCase())
    }, { message: 'Invalid gender value. Allowed values are male, female, and other.' })
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
  otp: zod.string().length(5).refine(value => /^\d+$/.test(value), { message: 'OTP must contain only digits' }),
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
  }).refine(file => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
    return allowedMimeTypes.includes(file.mimeType)
  }, { message: 'Invalid file type. Only JPEG, PNG, and GIF are allowed.' }),
}
