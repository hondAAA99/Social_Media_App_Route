import type { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../../DB/models/user.model.js";
import { signUpRequestBody } from "./auth.dto.js";
import {
  ErrorConflict,
  SuccessResponse,
} from "../../common/utils/globalresponse.js";
import { HydratedDocument } from "mongoose";
import repoBase from "../../DB/repo/repo.base.js";
import userRepo from "../../DB/repo/user.repo.js";
import { Globalhash } from "../../common/security/hash.js";
import { Globalencrypt } from "../../common/security/encrypt.js";

class auth {
  private readonly _userModel = new userRepo();
  constructor() {}

  public signUp = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const {
      userName,
      email,
      password,
      phone,
      gender,
      role,
    }: signUpRequestBody = req.body;
    const emailExists = await this._userModel.userEmailExists(email);
    if (emailExists) {
      ErrorConflict("email already exists");
    }

    const user: HydratedDocument<IUser> = await this._userModel.create({
      userName,
      email,
      password: Globalhash({ plainText: password }),
      phone: phone ? Globalencrypt({ plainText: phone }) : null,
      gender,
      role,
    } as Partial<IUser>);
    SuccessResponse({ res, data: user });
  };

  public confirmMail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {};

  public signUpWithGmail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {};

  public signIn = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {};

  public signInWithGmail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {};

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

export default new auth();
