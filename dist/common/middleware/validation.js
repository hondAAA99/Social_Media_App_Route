import { ErrorInteralServerError } from "../utils/globalresponse.js";
export const validationMiddleWare = (schema) => {
    return async (req, res, next) => {
        const arrOfError = [];
        for (const key of Object.keys(schema)) {
            if (!req[key])
                continue;
            const result = (await schema[key]?.safeParseAsync(req[key]));
            if (!result.success) {
                arrOfError.push(result?.error.message);
            }
        }
        if (arrOfError.length > 0) {
            ErrorInteralServerError({
                message: "validation error",
                errors: JSON.parse(arrOfError),
            });
        }
        next();
    };
};
