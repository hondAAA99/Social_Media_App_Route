import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import userServices from "./user.services.js";
import { authorize } from "../../common/middleware/authorize.js";
import { forgetPassword, resetPassowrd, updatePasswordSchema } from "./user.Schema.js";
import { validationMiddleWare } from "../../common/middleware/validation.js";

export const userRouter : Router = Router();

userRouter.put(
  "/forget-password",
  validationMiddleWare(forgetPassword),
  userServices.forgetPassword,
);

userRouter.patch(
  "/reset-password",
  validationMiddleWare(resetPassowrd),
  userServices.resetPassowrd,
);

userRouter.patch(
  "/update-password",
  validationMiddleWare(updatePasswordSchema),
  authenticate,
  userServices.updatePassword
);

userRouter.get("/log-out", authenticate ,userServices.logout);