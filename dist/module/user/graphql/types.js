import { GraphQLList, GraphQLObjectType, GraphQLString, } from "graphql";
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
