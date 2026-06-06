import z, { array } from "zod";
import availabiltyEnum from "../../common/enum/availablity.enum.js";
import allowCommentsEnum from "../../common/enum/allowComments.enum.js";
import { Types } from "mongoose";
import { genRules } from "../../common/utils/validationGeneralRules.js";
import hideLikeCount from "../../common/enum/hideLikeCounts.enum.js";

export const createPostSchema = {
  body: z
    .strictObject({
      content: z.string().optional,
      attachments: z.array(genRules.file).optional(),
      createdBy: z.string(),
      tags: z.array(genRules.id).optional,
      allowComments: z.enum(allowCommentsEnum).default(allowCommentsEnum.allow),
      hideLikeCount: z.enum(hideLikeCount).default(hideLikeCount.show),
      availability: z.enum(availabiltyEnum).default(availabiltyEnum.freinds),
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
      postId: z.string(),
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
      hideLikeCount: z.enum(hideLikeCount).optional(),
      availability: z.enum(availabiltyEnum).optional(),
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
