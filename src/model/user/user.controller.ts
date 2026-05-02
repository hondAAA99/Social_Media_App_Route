import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import userServices from "./user.services.js";
import { createSignedUrlSchem, updatePasswordSchema } from "./user.Schema.js";
import { validationMiddleWare } from "../../common/middleware/validation.js";

export const userRouter : Router = Router();


userRouter.patch(
  "/update-password",
  validationMiddleWare(updatePasswordSchema),
  authenticate,
  userServices.updatePassword
);

userRouter.post(
  '/create-signed-url',
  validationMiddleWare(createSignedUrlSchem),
  authenticate,
  userServices.uploadBySignedUrl
)

userRouter.post(
  '/get-file/*path',
  userServices.getFile
)
userRouter.post(
  '/get-signed-url/*path',
  userServices.getSignedUrl
)


userRouter.get("/log-out", authenticate ,userServices.logout);