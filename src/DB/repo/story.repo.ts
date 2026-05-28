import { Model } from 'mongoose'
import repoBase from './repo.base.js'
import storyModel, { IStory } from '../models/story.model.js'

class storyRepo extends repoBase<IStory> {
  constructor(protected readonly _model: Model<IStory> = storyModel) {
    super(_model)
  }
}

export default storyRepo
