import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
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
