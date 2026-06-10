import { rateLimit } from 'express-rate-limit';
import { ErrorInternalServerError } from '../utils/globalresponse.js';
const limiter = rateLimit({
    windowMs: 1000 * 60,
    limit: 4,
    handler: (req, res, next, options) => {
        ErrorInternalServerError('too many requests', 429);
    },
    legacyHeaders: false,
});
export default limiter;
