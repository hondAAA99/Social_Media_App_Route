import z from "zod";
import { genRules } from "../../common/utils/validationGeneralRules.js";
import onModelEnum from "../../common/enum/onModel.enum.js";
export const createComment = {
    body: z
        .strictObject({
        content: z.string().optional,
        attachments: z.array(genRules.file).optional(),
        tags: z.array(genRules.id).optional,
        onModel: z.enum(onModelEnum)
    })
        .superRefine((data, ctx) => {
        if (!data.content && !data?.attachments?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "you can not create an empty post",
            });
        }
        if (data?.tags &&
            data.tags.length !==
                new Set(data.tags).size) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "Duplicated tags",
            });
        }
    }),
    headers: z.object({
        authorization: z.string().refine((val) => val.length < 32, {
            message: "invalid token",
        }),
    }),
    params: z.object({
        postId: z.string(),
        commentId: z.string().optional(),
    })
};
