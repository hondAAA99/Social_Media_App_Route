import { ErrorInteralServerError } from "../utils/globalresponse.js";
import { GraphQLError } from "graphql";
export const validationMiddleWare = (schema) => {
    return async (req, res, next) => {
        const arrOfError = [];
        for (const key of Object.keys(schema)) {
            if (!req[key])
                continue;
            if (req?.file) {
                req.body.attachment = req.file;
            }
            if (req?.files) {
                req.body.attachments = req.files;
            }
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
export const validationGQL = async (schema, args) => {
    const arrOfError = [];
    const result = await schema.safeParseAsync(args);
    if (!result.success) {
        const errors = result.error.issues.map((err) => {
            return {
                path: err.path,
                message: err.message,
            };
        });
        arrOfError.push(errors);
    }
    if (arrOfError.length > 0) {
        return new GraphQLError("validationError", {
            extensions: {
                code: "validation error",
                status: 401,
                errors: arrOfError,
            },
        });
    }
};
