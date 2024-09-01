import { GraphQLFormattedError } from "graphql";
import { Mutation, Query } from "../__generatedTypes__/graphql.js";

export interface SingleGraphQLResponse<Response> {
  kind: string;
  data: Response;
  errors: readonly GraphQLFormattedError[];
}
export interface GraphQLResponses {
  school: Query["school"];
  schools: Query["schools"];
  allSchools: Query["allSchools"];
  addSchool: Mutation["addSchool"];
  deleteSchool: Mutation["deleteSchool"];
}
