import { GraphQLObjectType } from 'graphql';
import { authenticateGQL } from '../../../common/middleware/authenticate.js';
import { userData } from './types.js';
import postRepo from '../../../DB/repo/post.repo.js';
class GqlUserFields {
    _postModel = new postRepo();
    constructor() { }
    getUserData = () => {
        return {
            type: new GraphQLObjectType({
                name: 'userAndPosts',
                fields: {
                    user: { type: userData },
                },
            }),
            args: {},
            resolve: async (parent, args, context) => {
                const { user } = await authenticateGQL(context);
                return { user };
            },
        };
    };
}
export default new GqlUserFields();
