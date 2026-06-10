import { Model } from 'mongoose'
import repoBase from './repo.base.js'
import storyModel from '../models/stories/story.model.js'
import { IStory } from '../models/stories/story.interface.js'

class storyRepo extends repoBase<IStory> {
  constructor(protected readonly _model: Model<IStory> = storyModel) {
    super(_model)
  }
}

export default storyRepo
