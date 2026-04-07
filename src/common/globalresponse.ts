import type { Errback, Request, Response, NextFunction } from "express";

export class ErrorResponse extends Error {
  public statusCode: number;
  public message: string;
  constructor({
    message,
    statusCode,
  }: {
    message: string;
    statusCode: number;
  }) {
    super(message);
    ((this.message = message), (this.statusCode = statusCode));
  }
}

export const globalErrorHandling = (
  err: ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(err);
  const status = (err.statusCode as number) || 500;
  res.status(status).json({
    err: err.message,
    status,
    stack: err.stack,
  });
};
