import { GraphQLFormattedError } from "graphql";
export interface SingleGraphQLResponse<Response> {
  kind: string;
  data: Response;
  errors: readonly GraphQLFormattedError[];
}
