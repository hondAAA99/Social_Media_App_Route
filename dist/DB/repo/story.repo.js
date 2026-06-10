import repoBase from './repo.base.js';
import storyModel from '../models/stories/story.model.js';
class storyRepo extends repoBase {
    _model;
    constructor(_model = storyModel) {
        super(_model);
        this._model = _model;
    }
}
export default storyRepo;
