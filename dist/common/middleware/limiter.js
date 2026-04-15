import { rateLimit } from "express-rate-limit";
import { ErrorInteralServerError } from "../globalresponse.js";
const limiter = rateLimit({
    windowMs: 1000 * 60,
    limit: 4,
    handler: (req, res, next, options) => {
        ErrorInteralServerError("too many requests", 429);
    },
    legacyHeaders: false,
});
export default limiter;
