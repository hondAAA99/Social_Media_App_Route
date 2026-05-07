import z from "zod";
import { confirmSignUpSchema, signInSchema, signUpSchema } from "./auth.validationSchema.js";

export type signUpDTO = z.infer<typeof signUpSchema>
export type lobInDTO = z.infer<typeof signInSchema>
export type confirmEmailDTO = z.infer<typeof confirmSignUpSchema>

