import { ApolloServer } from "apollo-server-express";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { schema } from "../../GraphQL/schema.js";
import { Mutation, Query } from "../../__generatedTypes__/graphql.js";
import { users } from "../../data/index.js";
import { UserAttributes, UserModel } from "../../models/index.js";
import { MyContext } from "../../utils/auth.js";
import { SingleGraphQLResponse } from "../testTypes.js";

describe("User Resolvers", () => {
  let con: typeof mongoose;
  let db: MongoMemoryServer;
  let user: UserAttributes;
  let testServer: ApolloServer;

  beforeAll(async () => {
    db = await MongoMemoryServer.create();
    con = await mongoose.connect(db.getUri(), {});

    await UserModel.create(users);

    user = await UserModel.create({
      username: "test",
      email: "test@test.com",
      password: "password",
      isAdmin: true,
    });

    testServer = new ApolloServer<MyContext>({
      schema,
      context: ({ req }) => {
        return {
          user,
          req,
          res: {
            cookie: vi.fn(),
          },
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
  describe("Queries", () => {
    describe("me", () => {
      it("should return the current user", async () => {
        const response = (await testServer.executeOperation({
          query: `
            query {
              me {
                username
                email
              }
            }
          `,
        })) as SingleGraphQLResponse<Query>;

        expect(response.data?.me).toEqual({
          username: user.username,
          email: user.email,
        });
      });
      it("should throw an error if the user is not logged in", async () => {
        const testServer = new ApolloServer<MyContext>({
          schema,
          context: ({ req, res }) => {
            return {
              req,
              res,
            };
          },
        });

        const response = (await testServer.executeOperation({
          query: `
            query {
              me {
                username
                email
              }
            }
          `,
        })) as SingleGraphQLResponse<Query>;

        expect(response.data?.me).toBe(undefined);
        expect(response.errors?.[0].message).toBe("You need to be logged in");
      });
    });
    describe("allUsers", () => {
      it("should return all users if the current user is an admin", async () => {
        const response = (await testServer.executeOperation({
          query: `
            query {
              allUsers {
                username
                email
              }
            }
          `,
        })) as SingleGraphQLResponse<Query>;

        expect(response.data?.allUsers).toEqual([
          {
            username: users[0].username,
            email: users[0].email,
          },
          {
            username: user.username,
            email: user.email,
          },
        ]);
        expect(response.errors).toBeUndefined();
      });
      it("should throw an error if the current user is not an admin", async () => {
        const user = await UserModel.create({
          username: "nonAdminTest",
          email: "nonAdminTest@test.com",
          password: "password",
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
            query {
              allUsers {
                username
                email
              }
            }
          `,
        })) as SingleGraphQLResponse<Query>;

        expect(response.data?.allUsers).toBe(undefined);
        expect(response.errors?.[0].message).toBe(
          "You need to be an admin to view users",
        );
      });
    });
  });
  describe("User Mutations", () => {
    describe("addUser", () => {
      it("should add a new user, returning the user and a signed token", async () => {
        const response = (await testServer.executeOperation({
          query: `
            mutation {
              addUser(username: "newUser", email: "newemail@test.com", password: "password") {
                user {
                  username
                  email
                }
                token
              }
            }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.addUser.user).toEqual({
          username: "newUser",
          email: "newemail@test.com",
        });
        expect(response.errors).toBeUndefined();
        expect(response.data?.addUser.token).toBeTruthy();
      });
      it("should throw an error if the user is missing required fields", async () => {
        const response = (await testServer.executeOperation({
          query: `
            mutation {
              addUser(username: "", email: "", password: "") {
                user {
                  username
                  email
                }
                token
              }
            }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.addUser).toBe(undefined);
        expect(response.errors?.[0].message).toBe(
          "You need to provide a username, email, and password",
        );
      });
    });
    describe("deleteUser", () => {
      it("should throw an error if no user id is provided", async () => {
        const response = (await testServer.executeOperation({
          query: `
            mutation {
              deleteUser(id: "")
            }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.deleteUser).toBe(null);
        expect(response.errors?.[0].message).toBe("Please provide a user ID");
      });
      it("should throw an error if the user is not logged in", async () => {
        const testServer = new ApolloServer<MyContext>({
          schema,
          context: ({ req, res }) => {
            return {
              req,
              res,
            };
          },
        });

        const response = (await testServer.executeOperation({
          query: `
            mutation {
              deleteUser(id: "${user.id}")
            }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.deleteUser).toBe(null);
        expect(response.errors?.[0].message).toBe("You need to be logged in");
      });
      it("should throw an error if the current user is not an admin", async () => {
        const user = await UserModel.create({
          username: "nonAdmin",
          email: "nonadmin@test.com",
          password: "password",
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
              deleteUser(id: "${user.id}")
            }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.deleteUser).toBe(null);
        expect(response.errors?.[0].message).toBe(
          "You need to be an admin to delete a user",
        );
      });
      it("should delete a user if the current user is an admin", async () => {
        const deletedUser = await UserModel.create({
          username: "deleteMe",
          email: "delete@delete.com",
          password: "password",
        });

        const response = (await testServer.executeOperation({
          query: `
            mutation {
              deleteUser(id: "${deletedUser.id}")
            }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.deleteUser).toBe("User deleted successfully");
        expect(response.errors).toBeUndefined();
      });
      it("should throw an error if attempting to delete a user that doesn't exist", async () => {
        const response = (await testServer.executeOperation({
          query: `
            mutation {
              deleteUser(id: "507f1f77bcf86cd799439011")
            }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.deleteUser).toBe(null);
        expect(response.errors?.[0].message).toBe(
          "Couldn't find user with this id",
        );
      });
    });
    describe("updateUserInfo", () => {
      it("should throw an error if the user is not logged in", async () => {
        const testServer = new ApolloServer<MyContext>({
          schema,
          context: ({ req, res }) => {
            return {
              req,
              res,
            };
          },
        });

        const response = (await testServer.executeOperation({
          query: `
            mutation {
              updateUserInfo(username: "newUsername", email: "newEmail@email.com", zipcode: "12345", theme: "dark") {
                username
                email
                zipcode
                theme
              }
            }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.updateUserInfo).toBe(undefined);
        expect(response.errors?.[0].message).toBe("You need to be logged in");
      });
      it("should allow a user to update their information if logged in", async () => {
        const response = (await testServer.executeOperation({
          query: `
            mutation {
              updateUserInfo(username: "newUsername", email: "newEmail@email.com", zipcode: "12345", theme: "dark") {
                username
                email
                zipcode
                theme
              }
            }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.updateUserInfo).toEqual({
          username: "newUsername",
          email: "newEmail@email.com",
          zipcode: "12345",
          theme: "dark",
        });
        expect(response.errors).toBeUndefined();
      });
      it("should throw an error if the user doesn't exist", async () => {
        const fakeUser = {
          id: "507f1f77bcf86cd799439011",
        };

        const testServer = new ApolloServer<MyContext>({
          schema,
          context: ({ req, res }) => {
            return {
              user: fakeUser,
              req,
              res,
            };
          },
        });

        const response = (await testServer.executeOperation({
          query: `
            mutation {
              updateUserInfo(username: "newUsername", email: "newEmail@email.com", zipcode: "12345", theme: "dark") {
                username
                email
                zipcode
                theme
              }
            }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.updateUserInfo).toBe(undefined);
        expect(response.errors?.[0].message).toBe(
          "Couldn't find user with this id",
        );
      });
    });
  });
});
