import z from "zod";
import { createPostSchema, deletePostSchema, likePostSchema, updatePostSchema } from "./post.schema.js";

export type createPostDTO = z.infer<typeof createPostSchema.body>;
export type updatePostDTO = z.infer<typeof updatePostSchema.body>;
export type deletePostDTO = z.infer<typeof deletePostSchema.params>;
