import z from 'zod'
import { genRules } from '../../common/utils/validationGeneralRules.js'
import { onModelEnum, reactsEnum } from '../../common/enum/post_comment.base.enum.js'
export const createComment = {
  body: z
    .strictObject({
      content: z.string().optional(),
      attachments: z.array(genRules.shape.file).optional(),
      tags: z.array(genRules.shape.id).optional(),
      onModel: z.enum(onModelEnum),
    })
    .superRefine((data, ctx) => {
      if (!data.content && !data?.attachments?.length) {
        ctx.addIssue({
          code: 'custom',
          path: ['content'],
          message: 'you can not create an empty post',
        })
      }

      if (
        data?.tags &&
        (data.tags as Array<any>).length !==
          new Set(data.tags as Array<any>).size
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['tags'],
          message: 'Duplicated tags',
        })
      }
    }),

  headers: z.object({
    authorization: z.string().refine(val => val.length < 32, {
      message: 'invalid token',
    }),
  }),

  params: z.object({
    postId: z.string(),
    commentId: z.string().optional(),
  }),
}

export const updateComment = {
  body: z
    .strictObject({
      content: z.string().optional,
      attachments: z.array(genRules.shape.file).optional(),
      removedAttachments: z.array(genRules.shape.file).optional(),
      tags: z.array(genRules.shape.id).optional,
    })
    .superRefine((data, ctx) => {
      if (!data.content && !data?.attachments?.length) {
        ctx.addIssue({
          code: 'custom',
          path: ['content'],
          message: 'you can not create an empty post',
        })
      }

      if (
        data?.tags &&
        (data.tags as Array<any>).length !==
          new Set(data.tags as Array<any>).size
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['content'],
          message: 'Duplicated tags',
        })
      }
    }),

  headers: z.object({
    authorization: z.string().refine(val => val.length < 32, {
      message: 'invalid token',
    }),
  }),

  params: z.object({
    postId: z.string(),
    commentId: z.string().optional(),
  }),
}

export const deleteComment = {
  headers: z.object({
    authorization: genRules.shape.authorization,
  }),

  params: z.object({
    commentId: genRules.shape.id,
  }),
}

export const getComments = {
  headers: z.object({
    authorization: genRules.shape.authorization,
  }),

  params: z.object({
    postId: genRules.shape.id,
  }),

  query: z.object({
    limit: genRules.shape.searchLimit,
    page: genRules.shape.pageLimit,
  }),
}

export const getCommentByIdAndPaginateReplies = {
  headers: z.object({
    authorization: genRules.shape.authorization,
  }),

  params: z.object({
    commentId: genRules.shape.id,
  }),

  query: z.object({
    limit: genRules.shape.searchLimit,
    page: genRules.shape.searchLimit,
  }),
}

export const reactComment = {
  headers: z.object({
    authorization: genRules.shape.authorization,
  }),

  params: z.object({
    commentId: genRules.shape.id,
  }),

  query: z.object({
    flag: z.enum(Object.values(reactsEnum)),
  }),
}

export const hideComment = {
  headers: z.object({
    authorization: genRules.shape.authorization,
  }),

  params: z.object({
    commentId: genRules.shape.id,
  }),
}
