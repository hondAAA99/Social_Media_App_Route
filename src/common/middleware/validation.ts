import type { Request, Response, NextFunction } from "express";
import { safeParseAsync, z, ZodAny, ZodType } from "zod";
import { ErrorInteralServerError } from "../utils/globalresponse.js";
import { GraphQLError } from "graphql";

type reqType = keyof Request;
export type schemaType = Partial<Record<reqType, z.ZodSchema>>;

export const validationMiddleWare = (schema: schemaType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const arrOfError = [];
    for (const key of Object.keys(schema) as reqType[]) {
      if (!req[key]) continue;

      if (req?.file) {
        req.body.attachment = req.file;
      }
      if (req?.files) {
        req.body.attachments = req.files;
      }

      const result = (await schema[key]?.safeParseAsync(req[key])) as {
        success: boolean;
        error: any;
      };
      if (!result.success) {
        arrOfError.push(result?.error.message);
      }
    }

    if (arrOfError.length > 0) {
      ErrorInteralServerError({
        message: "validation error",
        errors: JSON.parse(arrOfError as unknown as string),
      });
    }
    next();
  };
};
export const validationGQL = async (schema: ZodType, args: any) => {
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
