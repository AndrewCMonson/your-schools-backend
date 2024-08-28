import { makeExecutableSchema } from "@graphql-tools/schema";
import { merge } from "lodash-es";
import { adminResolvers, adminTypeDefs } from "./Admin/adminSchema.js";
import { authResolvers, authTypeDefs } from "./Auth/authSchema.js";
import { reviewResolvers, reviewTypeDefs } from "./Reviews/reviewSchema.js";
import { schoolResolvers, schoolTypeDefs } from "./Schools/schoolSchema.js";
import { userResolvers, userTypeDefs } from "./Users/userSchema.js";

const typeDefsArray = [
  adminTypeDefs,
  authTypeDefs,
  userTypeDefs,
  schoolTypeDefs,
  reviewTypeDefs,
];
const resolversArray = [
  adminResolvers,
  authResolvers,
  userResolvers,
  schoolResolvers,
  reviewResolvers,
];

export const schema = makeExecutableSchema({
  typeDefs: typeDefsArray,
  resolvers: merge(resolversArray),
});
