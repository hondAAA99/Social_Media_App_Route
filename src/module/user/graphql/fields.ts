import { GraphQLList, GraphQLObjectType } from 'graphql'
import { authenticateGQL } from '../../../common/middleware/authenticate.js'
import { userData } from './types.js'
import { postData } from '../../posts/graphQL/types.js'
import postRepo from '../../../DB/repo/post.repo.js'

class GqlUserFields {
  private readonly _postModel = new postRepo()
  constructor() {}

  getUserData = () => {
    return {
      type: new GraphQLObjectType({
        name: 'userAndPosts',
        fields: {
          user: { type: userData },
        },
      }),
      args: {},
      resolve: async (parent: any, args: any, context: any) => {
        const { user } = await authenticateGQL(context)
        return { user };
      },
    }
  }
}

export default new GqlUserFields()
