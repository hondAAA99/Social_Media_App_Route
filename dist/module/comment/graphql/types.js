import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString, } from 'graphql';
export const GQLCommentType = new GraphQLObjectType({
    name: 'comment',
    fields: {
        content: { type: GraphQLString },
        attachments: { type: new GraphQLList(GraphQLString) },
        createdBy: { type: GraphQLID },
        tags: { type: new GraphQLList(GraphQLID) },
        folderId: { type: GraphQLString },
        refId: { type: GraphQLID },
        onModel: { type: GraphQLString },
        reacts: {
            type: new GraphQLObjectType({
                name: 'reacts',
                fields: {
                    reactsCount: {
                        type: new GraphQLObjectType({
                            name: 'reactsCount',
                            fields: {
                                total: { type: GraphQLInt },
                                like: { type: GraphQLInt },
                                love: { type: GraphQLInt },
                                sad: { type: GraphQLInt },
                                angry: { type: GraphQLInt },
                                care: { type: GraphQLInt },
                                wow: { type: GraphQLInt },
                            },
                        }),
                    },
                    reactedUsers: {
                        type: new GraphQLList(new GraphQLObjectType({
                            name: 'reactedUsers',
                            fields: {
                                userId: { type: GraphQLID },
                                react: { type: GraphQLString },
                            },
                        })),
                    },
                },
            }),
        },
        hideComment: { type: GraphQLBoolean },
    },
});
