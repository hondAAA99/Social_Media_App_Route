import z, { array } from "zod";
import { Types } from "mongoose";
import { genRules } from "../../common/utils/validationGeneralRules.js";
import { allowCommentsEnum, LikeCountAvailability } from "../../common/enum/post_comment.base.enum.js";
import AvailabilityEnum from "../../common/enum/availablity.enum.js";

export const createPostSchema = {
  body: z
    .strictObject({
      content: z.string().optional,
      attachments: z.array(genRules.file).optional(),
      createdBy: z.string(),
      tags: z.array(genRules.id).optional,
      allowComments: z.enum(allowCommentsEnum).default(allowCommentsEnum.allow),
      hideLikeCount: z.enum(LikeCountAvailability).default(LikeCountAvailability.show),
      availability: z.enum(AvailabilityEnum).default(AvailabilityEnum.friends),
    })
    .superRefine((data, ctx) => {
      if (!data.content && !data?.attachments?.length) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "you can not create an empty post",
        });
      }

      if (
        data?.tags &&
        (data.tags as Array<any>).length !==
          new Set(data.tags as Array<any>).size
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "Duplicated tags",
        });
      }

      if (data?.tags && (data.tags as Array<any>).includes(data.createdBy)) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "you cannot tag your self in that post",
        });
      }
    }),
};

export const likePostSchema = {
  params: z
    .strictObject({
      postId: genRules.id,
    })
    .superRefine((data, ctx) => {
      if (!Types.ObjectId.isValid(data.postId)) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "you can not create an empty post",
        });
      }
    }),
    query : z.object({
      flag : z.enum(['like','dislike'])
    })
};

export const updatePostSchema = {
  body: z
    .strictObject({
      content: z.string().optional(),
      attachments: z.array(genRules.file).optional(),
      removeFiles: z.array(z.string()).optional(),
      tags: z.array(genRules.id).optional,
      removeTags: z.array(genRules.id).optional,
      allowComment: z.enum(allowCommentsEnum).optional(),
      hideLikeCount: z.enum(LikeCountAvailability).optional(),
      availability: z.enum(AvailabilityEnum).optional(),
    })
    .superRefine((data, ctx) => {
      if (
        data?.tags &&
        (data.tags as Array<any>).length !==
          new Set(data.tags as Array<any>).size
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "Duplicated tags",
        });
      }
      if (
        data?.removeFiles &&
        (data.removeFiles as Array<any>).length !==
          new Set(data.removeFiles as Array<any>).size
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "Duplicated attachments to deleted",
        });
      }
    }),

  params: likePostSchema.params,
};

export const deletePostSchema = {
  params: likePostSchema.params,
};
