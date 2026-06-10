import repoBase from "./repo.base.js";
import postModel from "../models/posts/post.model.js";
class postRepo extends repoBase {
    _model;
    constructor(_model = postModel) {
        super(_model);
        this._model = _model;
    }
}
export default postRepo;
