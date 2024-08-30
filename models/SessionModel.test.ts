import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Types } from "mongoose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { signToken } from "../utils/auth.js";
import { SessionModel, UserAttributes, UserModel } from "./index.js";

describe("Session Model CRUD", () => {
  let con: typeof mongoose;
  let db: MongoMemoryServer;
  let sessionId: Types.ObjectId;
  let userId: Types.ObjectId;
  let user: UserAttributes;

  beforeAll(async () => {
    db = await MongoMemoryServer.create();
    con = await mongoose.connect(db.getUri(), {});

    user = await UserModel.create({
      username: "testUser",
      email: "test@test.com",
      password: "password",
    });

    userId = user.id;

    console.log("userId", userId);
  });

  afterAll(async () => {
    if (con) {
      await con.disconnect();
    }

    if (db) {
      await db.stop();
    }
  });

  it("should be able to create a new session", async () => {
    const token = signToken(user);

    const session = await SessionModel.create({
      user: userId,
      token,
    });

    if (!session) {
      throw new Error("Session not created");
    }

    sessionId = session.id;

    const createdSession = await SessionModel.findById({ _id: session.id });

    expect(createdSession).not.toBe(null);
    expect(createdSession?.user._id.toString()).toBe(userId);
    expect(createdSession?.token).toBe(session.token);
    expect(createdSession?.expireAt).toStrictEqual(session.expireAt);
  });

  it("should be able to update a session", async () => {
    const newToken = signToken(user);

    const updatedSession = await SessionModel.findByIdAndUpdate(
      { _id: sessionId },
      { token: newToken },
      { new: true },
    );

    expect(updatedSession).not.toBe(null);
    expect(updatedSession?.token).toBe(newToken);
  });

  it("should be able to delete a session", async () => {
    const session = await SessionModel.findById({
      _id: sessionId,
    });

    if (!session) {
      throw new Error("School not found");
    }

    await SessionModel.findOneAndDelete({
      _id: session.id,
    });

    const deletedSession = await SessionModel.findOne({
      _id: session.id,
    });

    expect(deletedSession).toBe(null);
  });
});
