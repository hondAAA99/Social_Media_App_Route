import repoBase from "./repo.base.js";
import userModel from "../models/user.model.js";
class userRepo extends repoBase {
    _model;
    constructor(_model = userModel) {
        super(_model);
        this._model = _model;
    }
    async userEmailExists({ email, confirmed, }) {
        return await this._model.findOne({
            filter: {
                "email.data": email,
                confirmed,
            },
        });
    }
}
export default userRepo;
