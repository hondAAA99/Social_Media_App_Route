import commentModel from "../models/comment.model.js";
import repoBase from "./repo.base.js";
class commentRepo extends repoBase {
    _commentModel;
    constructor(_commentModel = commentModel) {
        super(_commentModel);
        this._commentModel = _commentModel;
    }
}
export default new commentRepo();
