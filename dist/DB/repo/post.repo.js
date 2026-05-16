import repoBase from "./repo.base.js";
import postModel from "../models/post.model.js";
class new postRepo() extends repoBase {
    _model;
    constructor(_model = postModel) {
        super(_model);
        this._model = _model;
    }
}
export default new new postRepo()();
