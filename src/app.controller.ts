import express from "express";
import type { Application, Request, Response, NextFunction } from "express";
import { PORT, HOST } from "./config/config.services.js";
import helmet from "helmet";
import cors from "cors";
import {
  globalErrorHandling,
  ErrorNotFound,
} from "./common/utils/globalresponse.js";

import limiter from "./common/middleware/limiter.js";
import { checkDataBaseConnection } from "./DB/DB.connection.js";
import { authRouter } from "./module/auth/auth.controller.js";
import { userRouter } from "./module/user/user.controller.js";
import redisServices from "./common/services/redis.services.js";
import postRouter from "./module/posts/post.controller.js";
import commentRouter from "./module/comment/comment.controller.js";
import newsFeedRouter from "./module/newsFeed/newsFeed.controller.js";
const app: Application = express();
const port = Number(PORT);
const host = HOST;

const bootstrap = async () => {
  app.use(express.json());
  app.use(helmet(), cors(), limiter);
  checkDataBaseConnection()
  redisServices.connect();
  app.use("/auth", authRouter);
  app.use("/users", userRouter);
  app.use("/posts", postRouter);
  app.use("/news-feed", newsFeedRouter);
  
  app.all("{/*demo}", (req: Request, res: Response, next: NextFunction) => {
    ErrorNotFound(
      `the request on ${req.url} with method ${req.method} has wrong path`,
    );
  });

  app.use(globalErrorHandling);

  app.listen(port, () => {
    console.log(`app is running on port ${port}`);
  });
};

export default bootstrap;
