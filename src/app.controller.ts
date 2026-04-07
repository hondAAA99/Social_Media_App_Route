import express from "express";
import type { Application, Request, Response, NextFunction } from "express";
import { PORT } from "./config/config.services.js";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { ErrorResponse, globalErrorHandling } from "./common/globalresponse.js";

const app: Application = express();
const port = Number(PORT);
const limiter = rateLimit({
  windowMs: 1000 * 60 ,
  limit: 4,
  handler: (req, res, next, options) => {
    throw new ErrorResponse({
      message: "too many requests",
      statusCode: 404,
    });
  },
  legacyHeaders: false,
});
const bootstrap = async () => {
  app.use(express.json());
  app.use(helmet(), cors(), limiter);

  app.all("{/*demo}", (req: Request, res: Response, next: NextFunction) => {
    throw new ErrorResponse({
      message: `the request on ${req.url} with method ${req.method} has wrong path`,
      statusCode: 404,
    });
  });

  app.use(globalErrorHandling);

  app.listen(port, () => {
    console.log(`app is running on port ${port}`);
  });
};

export default bootstrap;
