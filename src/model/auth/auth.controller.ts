import auth from "./auth.services.js";
import { Router } from "express";
import { signUpSchema, signInSchema } from "./auth.validationSchema.js";
import { validationMiddleWare } from "../../common/middleware/validation.js";

export const authRouter: Router = Router();

authRouter.post("/sign-up", validationMiddleWare(signUpSchema), auth.signUp);
authRouter.post("/sign-in", validationMiddleWare(signInSchema), auth.signIn);
