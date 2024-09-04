import { ApolloServer } from "apollo-server-express";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { schema } from "../../GraphQL/schema.js";
import { Mutation, Query } from "../../__generatedTypes__/graphql.js";
import { users } from "../../data/index.js";
import { SchoolModel, UserAttributes, UserModel } from "../../models/index.js";
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

        const updatedUser = await UserModel.findById(user.id);

        user = updatedUser as UserAttributes;

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
    describe("updateUserPassword", () => {
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
              updateUserPassword(password: "password", newPassword: "newPassword") {
                username
                email
              }
            }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.updateUserPassword).toBe(null);
        expect(response.errors?.[0].message).toBe("You need to be logged in");
      });
      it("should throw an error if user doesn't provide a password or new password", async () => {
        const response = (await testServer.executeOperation({
          query: `
            mutation {
              updateUserPassword(password: "", newPassword: "") {
                username
                email
              }
            }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.updateUserPassword).toBe(null);
        expect(response.errors?.[0].message).toBe(
          "You need to provide a password and a new password",
        );
      });
      it("should throw an error if the new password is the same as the old password", async () => {
        const response = (await testServer.executeOperation({
          query: `
            mutation {
              updateUserPassword(password: "password", newPassword: "password") {
                username
                email
              }
            }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.updateUserPassword).toBe(null);
        expect(response.errors?.[0].message).toBe(
          "New password cannot be the same",
        );
      });
      it("should throw an error if the old password is incorrect", async () => {
        const response = (await testServer.executeOperation({
          query: `
            mutation {
              updateUserPassword(password: "wrongPassword", newPassword: "newPassword") {
                username
                email
              }
            }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.updateUserPassword).toBe(null);
        expect(response.errors?.[0].message).toBe("Incorrect password");
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
              updateUserPassword(password: "password", newPassword: "newPassword") {
                username
                email
              }
            }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.updateUserPassword).toBe(null);
        expect(response.errors?.[0].message).toBe(
          "Couldn't find user with this id",
        );
      });
      it("should update the user's password if all conditions are met", async () => {
        const response = (await testServer.executeOperation({
          query: `
            mutation {
              updateUserPassword(password: "password", newPassword: "newPassword") {
                username
                email
              }
            }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.updateUserPassword).toEqual({
          username: user?.username,
          email: user?.email,
        });
        expect(response.errors).toBeUndefined();
      });
    });
    describe("addToFavorites", () => {
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
              addToFavorites(schoolId: "507f1f77bcf86cd799439011"){
                id
                username
                favorites {
                  id
                  name
                  }
                }     
              }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.addToFavorites).toBe(undefined);
        expect(response.errors?.[0].message).toBe("You need to be logged in");
      });
      it("should add a school to the user's favorites", async () => {
        const testSchool = await SchoolModel.create({
          name: "Test School",
          city: "Test City",
          state: "TS",
          zip: "12345",
          description: "Test Description",
          students: 1000,
          teachers: 100,
          rating: 4,
        });

        const response = (await testServer.executeOperation({
          query: `
            mutation {
              addToFavorites(schoolId: "${testSchool.id}"){
                id
                username
                favorites {
                  id
                  name
                  }
                }
              }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.addToFavorites).toEqual({
          id: user.id,
          username: user?.username,
          favorites: [
            {
              id: testSchool.id,
              name: testSchool.name,
            },
          ],
        });
        expect(response.errors).toBeUndefined();
      });
    });
    describe("removeFromFavorites", () => {
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
              removeFromFavorites(schoolId: "507f1f77bcf86cd799439011"){
                id
                username
                favorites {
                  id
                  name
                  }
                }     
              }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.removeFromFavorites).toBe(undefined);
        expect(response.errors?.[0].message).toBe("You need to be logged in");
      });
      it("should remove a school from the user's favorites", async () => {
        const schools = await SchoolModel.find();
        const school = schools[0];

        const response = (await testServer.executeOperation({
          query: `
            mutation {
              removeFromFavorites(schoolId: "${school.id}"){
                id
                username
                favorites {
                  id
                  name
                  }
                }
              }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.removeFromFavorites).toEqual({
          id: user.id,
          username: user?.username,
          favorites: [],
        });
      });
      it("should throw an error if the school doesn't exist", async () => {
        const response = (await testServer.executeOperation({
          query: `
            mutation {
              removeFromFavorites(schoolId: "507f1f77bcf86cd799439011"){
                id
                username
                favorites {
                  id
                  name
                  }
                }     
              }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.removeFromFavorites).toBe(undefined);
        expect(response.errors?.[0].message).toBe(
          "No school found with this id",
        );
      });
      it("should throw an error if no school id is provided", async () => {
        const response = (await testServer.executeOperation({
          query: `
            mutation {
              removeFromFavorites(schoolId: ""){
                id
                username
                favorites {
                  id
                  name
                  }
                }     
              }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.removeFromFavorites).toBe(undefined);
        expect(response.errors?.[0].message).toBe("Please provide a school ID");
      });
      it("should throw an error if the user doesn't exist", async () => {
        const fakeUser = {
          id: "507f1f77bcf86cd799439011",
        };

        const schools = await SchoolModel.find();
        const school = schools[0];

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
              removeFromFavorites(schoolId: "${school.id}"){
                id
                username
                favorites {
                  id
                  name
                  }
                }     
              }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.removeFromFavorites).toBe(undefined);
        expect(response.errors?.[0].message).toBe(
          "Couldn't find user with this id",
        );
      });
    });
    describe("recoverPassword", () => {
      it("should throw an error if no email is provided", async () => {
        const response = (await testServer.executeOperation({
          query: `
            mutation {
              recoverPassword(email: "")
            }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.recoverPassword).toBe(undefined);
        expect(response.errors?.[0].message).toBe("Please provide an email");
      });
      it("should throw an error if no user is found with the provided email", async () => {
        const response = (await testServer.executeOperation({
          query: `
            mutation {
              recoverPassword(email: "noemail@email.com")
            }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.recoverPassword).toBe(undefined);
        expect(response.errors?.[0].message).toBe(
          "No user found with this email",
        );
      });
      it("should create a temporary password, hash it, and update the user's password", async () => {
        const newUser = await UserModel.create({
          username: "newestUser",
          email: "newnewnew@email.com",
          password: "password",
        });

        const testServer = new ApolloServer<MyContext>({
          schema,
          context: ({ req, res }) => {
            return {
              user: newUser,
              req,
              res,
            };
          },
        });

        const response = (await testServer.executeOperation({
          query: `
            mutation {
              recoverPassword(email: "${newUser.email}")
            }
          `,
        })) as SingleGraphQLResponse<Mutation>;

        expect(response.data?.recoverPassword).toBe(
          "Email sent with temporary password",
        );
        expect(response.errors).toBeUndefined();

        const updatedUser = await UserModel.findById(newUser.id);

        expect(updatedUser?.password).not.toBe(newUser.password);
      });
    });
  });
});
