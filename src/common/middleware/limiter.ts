import { rateLimit } from "express-rate-limit";
import { ErrorInteralServerError } from "../utils/globalresponse.js";
import type { Request, Response, NextFunction } from "express";

const limiter = rateLimit({
  windowMs: 1000 * 60,
  limit: 4,
  handler: (req: Request, res: Response, next: NextFunction, options) => {
    ErrorInteralServerError("too many requests", 429);
  },
  legacyHeaders: false,
});

export default limiter;
