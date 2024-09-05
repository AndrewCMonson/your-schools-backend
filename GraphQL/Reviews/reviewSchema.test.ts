import { ApolloServer } from "apollo-server-express";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Mutation } from "../../__generatedTypes__/graphql.js";
import { schools as schoolData } from "../../data/schools.js";
import {
  SchoolAttributes,
  SchoolModel,
  UserAttributes,
  UserModel,
} from "../../models/index.js";
import { MyContext } from "../../utils/auth.js";
import { schema } from "../schema.js";
import { SingleGraphQLResponse } from "../testTypes.js";
import { mean } from "lodash-es";

describe("Review Resolvers", () => {
  let con: typeof mongoose;
  let db: MongoMemoryServer;
  let testServer: ApolloServer;
  let user: UserAttributes;
  let schools: SchoolAttributes[];
  const firstRating: number = 5;
  const secondRating: number = 3;

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
          user,
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

  describe("Mutation.addReview", () => {
    it("should add a review to a school", async () => {
      const schoolId = schools[0].id;
      const review = "This is a test review";

      const response = (await testServer.executeOperation({
        query: `
          mutation {
           addReview(schoolId: "${schoolId}", rating: ${firstRating}, review: "${review}", owner: "${user.id}") {
              id
              rating
              review
              owner {
                id
                username
              }
            }
          }
        `,
      })) as SingleGraphQLResponse<Mutation>;

      expect(response.data?.addReview).toMatchObject({
        rating: 5,
        review,
        owner: {
          id: user.id,
          username: user.username,
        },
      });
    });
    it("should throw an error if the user is not logged in", async () => {
      const schoolId = schools[0].id;
      const review = "This is a test review";

      const testServer = new ApolloServer<MyContext>({
        schema,
        context: ({ req, res }) => {
          return {
            user: null,
            req,
            res,
          };
        },
      });

      const response = (await testServer.executeOperation({
        query: `
            mutation {
              addReview(schoolId: "${schoolId}", rating: 5, review: "${review}", owner: "${user.id}") {
                id
                rating
                review
                owner {
                  id
                  username
                }
              }
            }
          `,
      })) as SingleGraphQLResponse<Mutation>;

      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].message).toBe("You need to be logged in");
    });
    it("should throw an error if the user has already reviewed the school", async () => {
      const schoolId = schools[0].id;
      const review = "This is a test review";

      const response = (await testServer.executeOperation({
        query: `
          mutation {
            addReview(schoolId: "${schoolId}", rating: 5, review: "${review}", owner: "${user.id}") {
              id
              rating
              review
              owner {
                id
                username
              }
            }
          }
        `,
      })) as SingleGraphQLResponse<Mutation>;

      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].message).toBe(
        "You have already reviewed this school",
      );
    });
    it("should update the school's rating after a review is added", async () => {
      const schoolId = schools[0].id;
      console.log(schools[0].rating);
      const review = "This is a test review";
      const user = await UserModel.create({
        username: "test2",
        email: "test2@test.com",
        password: "password",
        isAdmin: true,
      });

      const testServer = new ApolloServer<MyContext>({
        schema,
        context: ({ req, res }) => {
          return {
            user,
            req,
            res,
          };
        },
      });

      const response = (await testServer.executeOperation({
        query: `
          mutation {
            addReview(schoolId: "${schoolId}", rating: ${secondRating}, review: "${review}", owner: "${user.id}") {
              id
              rating
              review
              owner {
                id
                username
              }
            }
          }
        `,
      })) as SingleGraphQLResponse<Mutation>;

      const updatedSchool = await SchoolModel.findById(schoolId);

      expect(response.data?.addReview).toMatchObject({
        rating: 3,
        review,
        owner: {
          id: user.id,
          username: user.username,
        },
      });
      expect(updatedSchool?.rating).toBe(mean([firstRating, secondRating]));
    });
  });
});
