import { GraphQLFormattedError } from "graphql";
export interface SingleGraphQLResponse<T> {
  kind: string;
  data: T;
  errors: readonly GraphQLFormattedError[];
}
