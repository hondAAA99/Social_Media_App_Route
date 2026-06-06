import mongoose, { model } from 'mongoose'
import { storySchema } from './stories.schema.js'

const storyModel = mongoose.models.stories || model('stories', storySchema)

export default storyModel
