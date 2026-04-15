import { Model } from "mongoose";
import repoBase from "./repo.base.js";
import userModel, { IUser } from "../models/user.model.js";
import { HydratedDocument } from "mongoose";

class userRepo extends repoBase<IUser> {
  constructor(protected readonly _model: Model<IUser> = userModel) {
    super(_model);
  }

  async userEmailExists(
    email: string,
  ): Promise<HydratedDocument<IUser> | null> {
    return await this.findOne({
      filter: {
        email,
      },
    });
  }
}

export default userRepo;
