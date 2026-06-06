import mongoose, { Schema } from 'mongoose'
import hideLikeCount from '../../../common/enum/hideLikeCounts.enum.js'
import { IReactCount, IReactedUser, IReacts } from './post.interface.js'
import { postSchema } from './posts.schema.js'

const postsSchemaHelpersCalling = () => {
  postSchema.pre(['findOne', 'find'], function () {
    const { paranoid, ...rest } = this.getQuery()
    if (paranoid == true) {
      // soft delete
      this.setQuery({
        deleteAt: { $exists: false },
        deletedBy: { $exists: false },
        rest,
      })
    } else this.setQuery({ rest })
  })

  postSchema.pre(
    ['deleteMany', 'deleteOne', 'findOneAndDelete'],
    async function () {
      const condition = this.getQuery()
      const userId = condition.createdBy
      await Promise.all([
        mongoose.models.comments!.deleteMany({
          createdBy: userId,
        }),
      ])
    },
  )

  postSchema.virtual('comments', {
    ref: 'comments',
    localField: '_id',
    foreignField: 'refId',
  })
}

export default postsSchemaHelpersCalling
