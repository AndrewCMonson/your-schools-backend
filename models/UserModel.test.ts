import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { UserAttributes, UserModel } from "./index.js";

describe("User Model CRUD", () => {
  let con: typeof mongoose;
  let db: MongoMemoryServer;
  let user: UserAttributes;

  beforeAll(async () => {
    db = await MongoMemoryServer.create();
    con = await mongoose.connect(db.getUri(), {});
  });

  afterAll(async () => {
    if (con) {
      await con.disconnect();
    }

    if (db) {
      await db.stop();
    }
  });

  it("should be able to create a new user and validate a password", async () => {
    user = await UserModel.create({
      username: "testUser",
      email: "test@test.com",
      password: "password",
    });

    const correctPassword = await user.isCorrectPassword("password");

    expect(user).not.toBe(null);
    expect(user.username).toBe("testUser");
    expect(user.email).toBe("test@test.com");
    expect(correctPassword).toBe(true);
  });

  it("should be able to update a user", async () => {
    const updatedUser = await UserModel.findByIdAndUpdate(
      { _id: user.id },
      { username: "newUsername" },
      { new: true },
    );

    expect(updatedUser).not.toBe(null);
    expect(updatedUser?.username).toBe("newUsername");
  });

  it("should hash the user's password upon creation", async () => {
    const newUser = await UserModel.create({
      username: "testUser2",
      email: "test@testing.com",
      password: "password",
    });

    expect(newUser).not.toBe(null);
    expect(newUser.password).not.toBe("password");
  });

  it("should be able to delete a user", async () => {
    await UserModel.findOneAndDelete({
      _id: user.id,
    });

    const deletedUser = await UserModel.findOne({
      _id: user.id,
    });

    expect(deletedUser).toBe(null);
  });
});
