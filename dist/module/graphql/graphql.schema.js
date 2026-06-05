import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import GqlUserFields from '../user/graphql/fields.js';
import GLpostsFields from '../posts/graphQL/fields.js';
import GLCommentFields from '../comment/graphql/fields.js';
const GQLSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'query',
        fields: {
            getUserData: GqlUserFields.getUserData(),
            getPostsData: GLpostsFields.getAllUserPosts(),
            getPostComments: GLCommentFields.getComments(),
        },
    }),
});
export default GQLSchema;
