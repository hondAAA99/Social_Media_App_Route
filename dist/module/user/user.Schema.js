import zod from 'zod';
import { genRules } from '../../common/utils/validationGeneralRules.js';
export const updatePasswordSchema = {
    body: zod
        .object({
        email: zod.email(),
        oldPassword: zod.string(),
        newPassword: zod.string(),
        newCPassword: zod.string(),
    })
        .superRefine((value, ctx) => {
        if (value.newPassword != value.newCPassword) {
            ctx.addIssue({
                code: zod.z.ZodIssueCode.custom,
                message: 'passwords do not match',
                path: ['cpassword'],
            });
        }
    }),
};
export const lockProfileSchema = {
    query: zod.object({
        flag: zod.enum(['lock', 'unlock']),
    }),
};
export const updateEmailSchema = {
    body: zod.object({
        email: genRules.email,
    }),
};
export const shareProfileSchema = {
    params: zod.object({
        userId: genRules.id,
    }),
};
export const updateProfileSchema = {
    body: zod.object({
        firstName: genRules.firstName,
        lastName: genRules.lastName,
        age: genRules.age,
        gender: genRules.gender,
        phone: genRules.phone,
        friends: genRules.friends,
    }),
};
export const updateEmailConfirmationSchema = {
    body: zod.object({
        newEmail: genRules.email,
        otp: genRules.otp,
    }),
};
export const logoutSchema = {
    query: zod.object({
        flag: zod.string().optional(),
    }),
};
export const sendFriendRequestSchema = {
    params: zod.object({
        requestedUserId: genRules.id,
    }),
};
export const handleFriendRequestSchema = {
    params: zod.object({
        requestingUserId: genRules.id,
        flag: zod.enum(['accept', 'reject']),
    }),
};
export const removeFriendSchema = {
    params: zod.object({
        friendId: genRules.id,
    }),
};
export const blockUserSchema = {
    params: zod.object({
        blockedUserId: genRules.id,
    }),
};
