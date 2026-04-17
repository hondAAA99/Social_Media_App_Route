import auth from "./auth.services.js";
import { Router } from "express";
import { signUpSchema, signInSchema, confirmSignUpSchema } from "./auth.validationSchema.js";
import { validationMiddleWare } from "../../common/middleware/validation.js";
export const authRouter = Router();
authRouter.post("/sign-up", validationMiddleWare(signUpSchema), auth.signUp);
authRouter.post("/confirm-sign-up", validationMiddleWare(confirmSignUpSchema), auth.confirmMail);
authRouter.post("/log-in", validationMiddleWare(signInSchema), auth.logIn);
authRouter.post("/sign-with-google", auth.signUpAndLoginWithGmail);
