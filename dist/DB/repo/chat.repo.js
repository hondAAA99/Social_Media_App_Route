import repoBase from './repo.base.js';
import chatModel from '../models/chat.model.js';
class chatRepo extends repoBase {
    _model;
    constructor(_model = chatModel) {
        super(_model);
        this._model = _model;
    }
}
export default chatRepo;
