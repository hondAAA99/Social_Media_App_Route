import repoBase from './repo.base.js';
import userModel from '../models/users/user.model.js';
class userRepo extends repoBase {
    _model;
    constructor(_model = userModel) {
        super(_model);
        this._model = _model;
    }
}
export default userRepo;
