import { makeExecutableSchema } from "@graphql-tools/schema";
import { merge } from "lodash-es";
import { schoolResolvers, schoolTypeDefs } from "./Schools/schoolSchema.js";
import { userResolvers, userTypeDefs } from "./Users/userSchema.js";
import { resolvers, typeDefs } from "../schemas/index.js";

const typeDefsArray = [userTypeDefs, schoolTypeDefs, typeDefs];
const resolversArray = [userResolvers, schoolResolvers, resolvers];

export const schema = makeExecutableSchema({
  typeDefs: typeDefsArray,
  resolvers: merge(resolversArray),
});
