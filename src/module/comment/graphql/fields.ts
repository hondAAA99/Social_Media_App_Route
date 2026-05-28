import { HydratedDocument } from 'mongoose'
import { authenticateGQL } from '../../../common/middleware/authenticate.js'
import postRepo from '../../../DB/repo/post.repo.js'
import { GQlgetCommentsArgs } from './args.js'
import { GQLCommentType } from './types.js'
import { IUser } from '../../../DB/models/user.model.js'
import { postAvailbilty } from '../../../common/utils/postUtils.js'

class GLCommentFields {
  constructor() {}

  getComments = () => {
    return {
      type: GQLCommentType,
      // args: GQlgetCommentsArgs,
      resolve: async (parent: any, args: any, context: any) => {
        const { user } = authenticateGQL(context) as any
        const { postId } = args
        const comments = await new postRepo().findAll({
          filter: {
            id: postId,
            availablity: {
              $or: [...postAvailbilty(context.req)],
            },
          },
          options: {
            populate: {
              path: 'comments',
              match: {
                commentId: { $exists: false },
              },
              populate: {
                path: 'replies',
              },
            },
          },
        })

        return comments;
      },
    }
  }
}

export default new GLCommentFields()
