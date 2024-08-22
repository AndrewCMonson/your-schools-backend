import { GraphQLScalarType } from "graphql";

export default new GraphQLScalarType({
  description: "No Value.",
  name: "Void",
  parseLiteral: () => null,
  parseValue: () => undefined,
  serialize: () => null,
});
