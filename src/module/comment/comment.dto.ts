import z from "zod";
import { createComment } from "./comment.validationSchema.js";

export type createCommentDTO = z.infer<typeof createComment.body>