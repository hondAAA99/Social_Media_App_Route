import type { Request, Response, NextFunction } from "express";

class user {
  constructor() {}

  public forgetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {};

  public async updatePassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {}

  public async logOut(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {}
}
