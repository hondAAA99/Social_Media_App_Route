import { GraphQLString } from "graphql";

class GqlAuthFields {
  constructor() {}

  GqlAuthFunction = () => {
    return {
      test: {
        type: GraphQLString,
        resolve: () => {
          return "auth test function is working";
        },
      },
    };
  };
}

export default new GqlAuthFields();
