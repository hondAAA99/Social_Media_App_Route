import { Types } from "mongoose";
import z from "zod";

export const genRules = {
  id: z
    .string()
    .refine(
      (value) => {
        return Types.ObjectId.isValid(value);
      },
      { message: "inValid id" },
    )
    .optional(),
    file : z.object({
      feildname : z.string(),
      originalname : z.string(),
      encoding : z.string(),
      mimeType : z.string(),
      buffer : z.any().optional(),
      path : z.string().optional(),
      size : z.number()
    })
};
