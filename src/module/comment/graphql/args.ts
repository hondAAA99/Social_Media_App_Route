import { GraphQLID, GraphQLObjectType } from 'graphql'

export const GQlgetCommentsArgs = new GraphQLObjectType({
  name: 'commentId',
  fields: {
    postId: {type : GraphQLID},
  },
})
