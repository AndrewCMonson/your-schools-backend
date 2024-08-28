import { makeExecutableSchema } from "@graphql-tools/schema";
import { merge } from "lodash-es";
import { authResolvers, authTypeDefs } from "./Auth/authSchema.js";
import { schoolResolvers, schoolTypeDefs } from "./Schools/schoolSchema.js";
import { userResolvers, userTypeDefs } from "./Users/userSchema.js";
import { resolvers, typeDefs } from "../schemas/index.js";

const typeDefsArray = [authTypeDefs, userTypeDefs, schoolTypeDefs, typeDefs];
const resolversArray = [
  authResolvers,
  userResolvers,
  schoolResolvers,
  resolvers,
];

export const schema = makeExecutableSchema({
  typeDefs: typeDefsArray,
  resolvers: merge(resolversArray),
});
