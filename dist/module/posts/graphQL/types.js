import { GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString, } from "graphql";
export const GQLPostsType = new GraphQLList(new GraphQLObjectType({
    name: "postsType",
    fields: {
        content: {
            type: GraphQLString,
        },
        attachements: {
            type: new GraphQLList(GraphQLString),
        },
        tags: {
            type: new GraphQLList(GraphQLString),
        },
        AllowComments: {
            type: GraphQLString,
        },
        Avalability: {
            type: GraphQLString,
        },
        FolderID: {
            type: new GraphQLList(GraphQLString),
        },
        reactedUsers: {
            type: new GraphQLList(GraphQLString),
        },
        reactCount: {
            type: GraphQLInt,
        },
    },
}));
