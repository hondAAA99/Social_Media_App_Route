import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import commentServices from "./comment.services.js";
import { fileUpload } from "../../common/middleware/multer.js";
import multerFileEnum from "../../common/enum/multerFileType.js";

const commentRouter: Router = Router();

commentRouter.post(
  "/create-comment/:postID",
  fileUpload({ fileType: multerFileEnum.image }).array("attachments"),
  authenticate,
  commentServices.createComment,
);
commentRouter.get("/get-comments", authenticate,commentServices.getComments);
commentRouter.put("/update-comment", authenticate,commentServices.updateComment);
commentRouter.delete("/delete-comment", authenticate,commentServices.deleteComments);

export default commentRouter;
