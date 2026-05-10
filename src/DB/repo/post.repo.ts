  import { Model } from "mongoose";
  import repoBase from "./repo.base.js";
import postModel, { IPost } from "../models/post.model.js";

  class postRepo extends repoBase<IPost> {
  constructor(protected readonly _model: Model<IPost> = postModel) {
    super(_model);
  }
  }

  export default new postRepo();
