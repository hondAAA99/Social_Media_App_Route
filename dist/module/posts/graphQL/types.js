import { GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString, } from "graphql";
export const postData = new GraphQLObjectType({
    name: "postData",
    fields: {
        content: { type: GraphQLString },
        attachments: { type: new GraphQLList(GraphQLString) },
        createdBy: { type: GraphQLID },
        tags: { type: new GraphQLList(GraphQLID) },
        allowComments: { type: GraphQLString },
        availablity: { type: GraphQLString },
        folderId: { type: GraphQLString },
        reactCount: { type: GraphQLInt },
        reactedUsers: { type: new GraphQLList(GraphQLID) },
    },
});
