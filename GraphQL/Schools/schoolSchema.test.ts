import { ApolloServer } from "apollo-server-express";
import { GraphQLFormattedError } from "graphql";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { schools as schoolData } from "../../data/schools.js";
import { SchoolAttributes, SchoolModel } from "../../models/index.js";
import { schema } from "../schema.js";

describe("School Resolvers", async () => {
  let con: typeof mongoose;
  let db: MongoMemoryServer;
  let schools: SchoolAttributes[];
  let testServer: ApolloServer;

  type SchoolResponse = {
    school: SchoolAttributes;
    schools: {
      schools: SchoolAttributes[];
    };
    allSchools: SchoolAttributes[];
  };

  type SingleGraphQLResponse<SchoolResponse> = {
    kind: string;
    data: SchoolResponse;
    errors: readonly GraphQLFormattedError[];
  };

  beforeAll(async () => {
    db = await MongoMemoryServer.create();
    con = await mongoose.connect(db.getUri(), {});

    schools = await SchoolModel.create(schoolData);

    testServer = new ApolloServer({
      schema,
    });
  });

  afterAll(async () => {
    if (con) {
      await con.disconnect();
    }

    if (db) {
      await db.stop();
    }
  });

  describe("Queries", async () => {
    describe("school", async () => {
      it("should return a school by id", async () => {
        const response = (await testServer.executeOperation({
          query: `
            query {
              school(id: "${schools[0].id}") {
                name
                address
                city
                state
                zipcode
              }
            }
          `,
        })) as SingleGraphQLResponse<SchoolResponse>;

        console.log(response);

        expect(response.errors).toBe(undefined);
        expect(response.data?.school?.name).toBe(schools[0].name);
      });
      it("should return an error if the school is not found", async () => {
        const response = (await testServer.executeOperation({
          query: `
            query {
              school(id: "123") {
                name
                address
                city
                state
                zipcode
              }
            }
          `,
        })) as SingleGraphQLResponse<SchoolResponse>;

        expect(response.data).toBe(null);
        expect(response.errors).not.toBe(undefined);
      });
    });
    describe("schools", async () => {
      it("should return schools by zipcode", async () => {
        const response = (await testServer.executeOperation({
          query: `
            query {
              schools(zipcode: "23462") {
                schools {
                  name
                  address
                  city
                  state
                  zipcode
                }
              }
            }
          `,
        })) as SingleGraphQLResponse<SchoolResponse>;

        expect(response.errors).toBe(undefined);
        expect(response.data?.schools?.schools.length).toBe(4);
      });
      it("should return an empty array if no zipcode is provided", async () => {
        const response = (await testServer.executeOperation({
          query: `
            query {
              schools {
                schools {
                  name
                  address
                  city
                  state
                  zipcode
                }
              }
            }
          `,
        })) as SingleGraphQLResponse<SchoolResponse>;

        expect(response.errors).toBe(undefined);
        expect(response.data?.schools?.schools.length).toBe(0);
      });
    });
    describe("allSchools", async () => {
      it("should return all schools", async () => {
        const response = (await testServer.executeOperation({
          query: `
            query {
              allSchools {
                name
                address
                city
                state
                zipcode
              }
            }
          `,
        })) as SingleGraphQLResponse<SchoolResponse>;

        expect(response.errors).toBe(undefined);
        expect(response.data?.allSchools?.length).toBe(11);
      });
    });
  });
});
