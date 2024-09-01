import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import { ApolloServer } from "apollo-server-express";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MyContext } from "../../utils/auth.js";
import { schema } from "../../GraphQL/schema.js";
import { schools } from "../../data/schools.js";
import { UserModel, UserAttributes } from "../../models/index.js";

describe("User Resolvers", () => {
  let con: typeof mongoose;
  let db: MongoMemoryServer;
  let user: UserAttributes;
  let testServer: ApolloServer;

  beforeAll(async () => {
    db = await MongoMemoryServer.create();
    con = await mongoose.connect(db.getUri(), {});

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
});
