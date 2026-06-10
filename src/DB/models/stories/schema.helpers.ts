import { storySchema } from './stories.schema.js'

const StorySchemaHelpersCalling = () => {
  storySchema.pre(['findOne', 'find', 'findOneAndUpdate'], function () {
    const query = this.getQuery()
    const { paranoid, ...rest } = query
    if (paranoid && paranoid === true) {
      this.setQuery({ deletedAt: { $exists: false }, ...rest })
    } else {
      this.setQuery({ ...rest })
    }
  })

  storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 })
}

export default StorySchemaHelpersCalling
