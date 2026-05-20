import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
// import GqlAuthFields from "../auth/graphql/fields.js"; // Not used
import GqlUserFields from "../user/graphql/fields.js";

// const GQLSchema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name: "query",
//     fields: {
//       getUserData : GqlUserFields.getUserDataAndPosts(),
//     },
//   }),
// });

const GQLSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "query",
    fields: {
      ping: {
        type: GraphQLString,
        resolve: () => "pong",
      },
    },
  }),
});

export default GQLSchema;
