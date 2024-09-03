import { GraphQLFormattedError } from "graphql";
export interface SingleGraphQLResponse<TResponse> {
  kind: string;
  data: TResponse;
  errors: readonly GraphQLFormattedError[];
}
