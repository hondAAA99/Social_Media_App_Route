import { Model } from "mongoose";
import commentModel, { IComment } from "../models/comment.model.js";
import repoBase from "./repo.base.js";

class commentRepo extends repoBase<IComment> {
  constructor(private readonly _commentModel: Model<IComment> = commentModel) {
    super(_commentModel);
  }
}

export default new commentRepo();
