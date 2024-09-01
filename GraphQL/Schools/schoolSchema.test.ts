import { BaseContext } from "@apollo/server";
import { ApolloServer } from "apollo-server-express";
import { Request, Response } from "express";
import { GraphQLFormattedError } from "graphql";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { schools as schoolData } from "../../data/schools.js";
import {
  ReviewModel,
  SchoolAttributes,
  SchoolModel,
  UserAttributes,
  UserModel,
} from "../../models/index.js";
import { schema } from "../schema.js";

describe("School Resolvers", async () => {
  let con: typeof mongoose;
  let db: MongoMemoryServer;
  let schools: SchoolAttributes[];
  let user: UserAttributes;
  let testServer: ApolloServer;

  interface SchoolResponse {
    school: SchoolAttributes & {
      latLng: {
        lat: number;
        lng: number;
      };
    };
    schools: {
      schools: SchoolAttributes[];
    };
    allSchools: SchoolAttributes[];
    addSchool: SchoolAttributes;
    deleteSchool: string;
  }

  interface SingleGraphQLResponse<SchoolResponse> {
    kind: string;
    data: SchoolResponse;
    errors: readonly GraphQLFormattedError[];
  }

  interface MyContext extends BaseContext {
    user: UserAttributes;
    req: Request;
    res: Response;
  }

  beforeAll(async () => {
    db = await MongoMemoryServer.create();
    con = await mongoose.connect(db.getUri(), {});

    schools = await SchoolModel.create(schoolData);
    user = await UserModel.create({
      username: "test",
      email: "test@test.com",
      password: "password",
      isAdmin: true,
    });

    testServer = new ApolloServer<MyContext>({
      schema,
      context: ({ req, res }) => {
        return {
          user: {
            isAdmin: true,
          },
          req,
          res,
        };
      },
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
      it("should return an empty array if there are no schools found", async () => {
        const response = (await testServer.executeOperation({
          query: `
            query {
              schools(zipcode: "29680") {
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
  describe("Mutations", async () => {
    describe("addSchool", async () => {
      it("should create a new school only if admin user requests", async () => {
        const newServer = new ApolloServer<MyContext>({
          schema,
          context: ({ req, res }) => {
            return {
              user: {
                isAdmin: true,
              },
              req,
              res,
            };
          },
        });

        const response = (await newServer.executeOperation({
          query: `
            mutation {
              addSchool(
                name: "Test School"
                address: "123 Test St."
                city: "Test City"
                state: "TS"
                zipcode: "12345"
              ) {
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
        expect(response.data?.addSchool.name).toBe("Test School");
      });

      it("should return an error if a non-admin user requests", async () => {
        const newServer = new ApolloServer<MyContext>({
          schema,
          context: ({ req, res }) => {
            return {
              user: {
                isAdmin: false,
              },
              req,
              res,
            };
          },
        });

        const response = (await newServer.executeOperation({
          query: `
            mutation {
              addSchool(
                name: "Test School"
                address: "123 Test St."
                city: "Test City"
                state: "TS"
                zipcode: "12345"
              ) {
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

      it("should return an error if the required fields are not provided", async () => {
        const response = (await testServer.executeOperation({
          query: `
            mutation {
              addSchool(
                name: "Test School"
                address: "123 Test St."
                city: "Test City"
                state: "TS"
                zipcode: ""
              ) {
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

    describe("deleteSchool", async () => {
      it("should delete a school by id only if admin user requests", async () => {
        const newServer = new ApolloServer<MyContext>({
          schema,
          context: ({ req, res }) => {
            return {
              user: {
                isAdmin: true,
              },
              req,
              res,
            };
          },
        });

        const response = (await newServer.executeOperation({
          query: `
            mutation {
              deleteSchool(id: "${schools[0].id}")
            }
          `,
        })) as SingleGraphQLResponse<SchoolResponse>;

        expect(response.errors).toBe(undefined);
        expect(response.data?.deleteSchool).toBe("School deleted successfully");
      });

      it("should return an error if a non-admin user requests", async () => {
        const newServer = new ApolloServer<MyContext>({
          schema,
          context: ({ req, res }) => {
            return {
              user: {
                isAdmin: false,
              },
              req,
              res,
            };
          },
        });

        const response = (await newServer.executeOperation({
          query: `
            mutation {
              deleteSchool(id: "${schools[0].id}")
            }
          `,
        })) as SingleGraphQLResponse<SchoolResponse>;

        expect(response.data.deleteSchool).toBe(null);
        expect(response.errors).not.toBe(undefined);
      });

      it("should return an error if the school id is not provided", async () => {
        const response = (await testServer.executeOperation({
          query: `
            mutation {
              deleteSchool(id: "")
            }
          `,
        })) as SingleGraphQLResponse<SchoolResponse>;

        expect(response.data.deleteSchool).toBe(null);
        expect(response.errors).not.toBe(undefined);
      });
    });
  });
  describe("School subresolvers", async () => {
    describe("getLatLng", async () => {
      it("should return a latLng object with lat and lng properties", async () => {
        const response = (await testServer.executeOperation({
          query: `
            query {
              school(id: "${schools[1].id}") {
                latLng {
                  lat
                  lng
                }
              }
            }
          `,
        })) as SingleGraphQLResponse<SchoolResponse>;

        expect(response.errors).toBe(undefined);
        expect(response.data?.school?.latLng).toHaveProperty("lat");
        expect(response.data?.school?.latLng).toHaveProperty("lng");
      });
    });

    describe("reviews", async () => {
      it("should return reviews for a school", async () => {
        const newReview = await ReviewModel.create({
          rating: 5,
          review: "Great school",
          owner: user.id,
          school: schools[1].id,
        });

        await SchoolModel.findByIdAndUpdate(
          { _id: schools[1].id },
          { $addToSet: { reviews: newReview.id } },
          { new: true },
        );

        const response = (await testServer.executeOperation({
          query: `
            query {
              school(id: "${schools[1].id}") {
                reviews {
                  rating
                  review
                }
              }
            }
          `,
        })) as SingleGraphQLResponse<SchoolResponse>;

        expect(response.errors).toBe(undefined);
        expect(response.data?.school?.reviews.length).toBe(1);
      });

      it("should throw an error if no reviews are found", async () => {
        const response = (await testServer.executeOperation({
          query: `
            query {
              school(id: "${schools[2].id}") {
                reviews {
                  rating
                  review
                }
              }
            }
          `,
        })) as SingleGraphQLResponse<SchoolResponse>;

        expect(response.errors).toBe(undefined);
        expect(response.data?.school?.reviews.length).toBe(0);
      });
    });
  });
});
