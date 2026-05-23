import { GraphQLObjectType, GraphQLSchema } from "graphql";
import GqlUserFields from "../user/graphql/fields.js";
const GQLSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "query",
        fields: {
            getUserData: GqlUserFields.getUserDataAndPosts(),
        },
    }),
});
export default GQLSchema;
