import { GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString, } from "graphql";
export const userData = new GraphQLObjectType({
    name: "userData",
    fields: {
        userName: { type: GraphQLString },
        email: { type: GraphQLString },
        profilePicture: { type: GraphQLString },
        friends: { type: new GraphQLList(GraphQLString) },
        phone: { type: GraphQLString },
        age: { type: GraphQLString },
        gender: { type: GraphQLString },
    },
});
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
