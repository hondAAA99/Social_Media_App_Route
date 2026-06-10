import { Schema } from 'mongoose';
import zod from 'zod';
import AvailabilityEnum from '../enum/availablity.enum.js';
import { reactsEnum } from '../enum/post_comment.base.enum.js';
import { blockUserEnum } from '../enum/user.base.enum.js';
export const genRules = zod.object({
    email: zod.email(),
    firstName: zod
        .string()
        .min(2)
        .max(100)
        .refine(value => {
        return value.length > 2;
    }, { message: 'firstName should not contain spaces' }),
    lastName: zod
        .string()
        .min(2)
        .max(100)
        .refine(value => value.length > 2, {
        message: 'lastName should not contain spaces',
    }),
    age: zod.object({
        data: zod.number(),
        availability: zod.enum(Object.values(AvailabilityEnum)),
    }),
    gender: zod
        .object({
        data: zod.string(),
        availability: zod.enum(Object.values(AvailabilityEnum)),
    })
        .refine(obj => {
        const allowedGenders = ['male', ' female', 'other'];
        return (obj.data === undefined ||
            allowedGenders.includes(obj.data.toLowerCase()));
    }, {
        message: 'Invalid gender value. Allowed values are male, female, and other.',
    }),
    phone: zod.object({
        data: zod.string(),
        availability: zod.enum(Object.values(AvailabilityEnum)),
    }),
    friends: zod.object({
        availability: zod.enum(Object.values(AvailabilityEnum)),
    }),
    otp: zod
        .string()
        .length(5)
        .refine(value => /^\d+$/.test(value), {
        message: 'OTP must contain only digits',
    }),
    id: zod.string().transform(value => {
        return new Schema.Types.ObjectId(value);
    }),
    file: zod
        .object({
        feildname: zod.string(),
        originalname: zod.string(),
        encoding: zod.string(),
        mimeType: zod.string(),
        buffer: zod.any(),
        path: zod.string(),
        size: zod.number(),
    })
        .refine(file => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        return allowedMimeTypes.includes(file.mimeType);
    }, { message: 'Invalid file type. Only JPEG, PNG, and GIF are allowed.' }),
    authorization: zod.string().refine(val => val.length < 32, {
        message: 'invalid token',
    }),
    searchLimit: zod.string().refine(val => !isNaN(Number(val)), {
        message: 'limit must be a number',
    }),
    pageLimit: zod.string().refine(val => !isNaN(Number(val)), {
        message: 'page must be a number',
    }),
    reactFlag: zod
        .enum(Object.values(reactsEnum))
        .refine(val => Object.values(reactsEnum).includes(val), {
        message: 'Invalid react type',
    }),
    lockProfileFlag: zod
        .enum(Object.values(AvailabilityEnum))
        .refine(val => Object.values(AvailabilityEnum).includes(val), {
        message: 'Invalid flag value',
    }),
    friendRequestFlag: zod
        .enum(Object.values(AvailabilityEnum))
        .refine(val => ['accept', 'reject'].includes(val), {
        message: 'Invalid flag value',
    }),
    blockUserFlag: zod
        .enum(Object.values(blockUserEnum))
        .refine(val => ['accept', 'reject'].includes(val), {
        message: 'Invalid flag value',
    }),
    password: zod.string(),
    passwordSchema: zod
        .object({
        password: zod.string(),
        cpassword: zod.string(),
    })
        .superRefine(({ password, cpassword }, ctx) => {
        if (password != cpassword) {
            ctx.addIssue({
                code: zod.z.ZodIssueCode.custom,
                message: 'passwords do not match',
                path: ['cpassword'],
            });
        }
    }),
});
