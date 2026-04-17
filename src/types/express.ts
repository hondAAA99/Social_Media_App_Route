import { HydratedDocument } from "mongoose";
import { IUser } from "../DB/models/user.model.js";

declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<IUser>;
      token?: string;
      tokenDecoded?: any;
    }
  }
}
