import z from 'zod';
import { Types } from 'mongoose';
import { genRules } from '../../common/utils/validationGeneralRules.js';
import { allowCommentsEnum, LikeCountAvailability, } from '../../common/enum/post_comment.base.enum.js';
import AvailabilityEnum from '../../common/enum/availablity.enum.js';
export const createPostSchema = {
    body: z
        .strictObject({
        content: z.string().optional,
        attachments: z.array(genRules.shape.file).optional(),
        createdBy: z.string(),
        tags: z.array(genRules.shape.id).optional,
        allowComments: z.enum(allowCommentsEnum).default(allowCommentsEnum.allow),
        hideLikeCount: z
            .enum(LikeCountAvailability)
            .default(LikeCountAvailability.show),
        availability: z.enum(AvailabilityEnum).default(AvailabilityEnum.friends),
    })
        .superRefine((data, ctx) => {
        if (!data.content && !data?.attachments?.length) {
            ctx.addIssue({
                code: 'custom',
                path: ['content'],
                message: 'you can not create an empty post',
            });
        }
        if (data?.tags &&
            data.tags.length !==
                new Set(data.tags).size) {
            ctx.addIssue({
                code: 'custom',
                path: ['content'],
                message: 'Duplicated tags',
            });
        }
        if (data?.tags && data.tags.includes(data.createdBy)) {
            ctx.addIssue({
                code: 'custom',
                path: ['content'],
                message: 'you cannot tag your self in that post',
            });
        }
    }),
};
export const likePostSchema = {
    params: z
        .strictObject({
        postId: genRules.shape.id,
    })
        .superRefine((data, ctx) => {
        if (!Types.ObjectId.isValid(data.postId)) {
            ctx.addIssue({
                code: 'custom',
                path: ['content'],
                message: 'you can not create an empty post',
            });
        }
    }),
    query: z.object({
        flag: z.enum(['like', 'dislike']),
    }),
};
export const updatePostSchema = {
    body: z
        .strictObject({
        content: z.string().optional(),
        attachments: z.array(genRules.shape.file).optional(),
        removeFiles: z.array(z.string()).optional(),
        tags: z.array(genRules.shape.id).optional,
        removeTags: z.array(genRules.shape.id).optional,
        allowComment: z.enum(allowCommentsEnum).optional(),
        hideLikeCount: z.enum(LikeCountAvailability).optional(),
        availability: z.enum(AvailabilityEnum).optional(),
    })
        .superRefine((data, ctx) => {
        if (data?.tags &&
            data.tags.length !==
                new Set(data.tags).size) {
            ctx.addIssue({
                code: 'custom',
                path: ['content'],
                message: 'Duplicated tags',
            });
        }
        if (data?.removeFiles &&
            data.removeFiles.length !==
                new Set(data.removeFiles).size) {
            ctx.addIssue({
                code: 'custom',
                path: ['content'],
                message: 'Duplicated attachments to deleted',
            });
        }
    }),
    params: likePostSchema.params,
};
export const deletePostSchema = {
    params: likePostSchema.params,
};
