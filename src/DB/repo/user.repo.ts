  import { Model } from "mongoose";
  import repoBase from "./repo.base.js";
  import userModel, { IUser } from "../models/user.model.js";
  import { HydratedDocument } from "mongoose";

  class userRepo extends repoBase<IUser> {
  constructor(protected readonly _model: Model<IUser | any> = userModel) {
    super(_model);
  }

  async userEmailExists( {email , confirmed }: { email: string, confirmed? : boolean | undefined} ): Promise<HydratedDocument<IUser> | null> {
    return await this.findOne({
      filter: {
        email,
        confirmed,
      } as {email : string , confirmed : boolean },
    });
  }
  }

  export default userRepo;
