import z from 'zod'
import {
  createComment,
  deleteComment,
  getCommentByIdAndPaginateReplies,
  getComments,
  hideComment,
  reactComment,
  updateComment,
} from './comment.validationSchema.js'

export type createCommentDTOBody = z.infer<typeof createComment.body>
export type createCommentDTOParams = z.infer<typeof createComment.params>
export type updateCommentDTOBody = z.infer<typeof updateComment.body>
export type updateCommentDTOParams = z.infer<typeof updateComment.params>
export type updateCommentDTOHeader = z.infer<typeof updateComment.headers>
export type deleteCommentDTOHeader = z.infer<typeof deleteComment.headers>
export type deleteCommentDTOParams = z.infer<typeof deleteComment.params>
export type getCommentsDTOQuery = z.infer<typeof getComments.query>
export type getCommentsDTOParams = z.infer<typeof getComments.params>
export type getCommentsDTOHeader = z.infer<typeof getComments.headers>
export type getCommentByIdAndPaginateRepliesDTO = z.infer<
  typeof getCommentByIdAndPaginateReplies.params
>
export type reactCommentDTOHeader = z.infer<typeof reactComment.headers>
export type reactCommentDTOQuery = z.infer<typeof reactComment.query>
export type reactCommentDTOParams = z.infer<typeof reactComment.params>
export type hideCommentDTOheaders = z.infer<typeof hideComment.headers>
export type hideCommentDTOParams = z.infer<typeof hideComment.params>
