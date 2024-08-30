import { ExpressContextFunctionArgument } from "@apollo/server/express4";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Types } from "mongoose";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { SessionModel, UserModel } from "../models/index.js";
import { authMiddleware, JwtPayload } from "../utils/auth.js";
import { signToken } from "./auth.js";

let con: typeof mongoose;
let db: MongoMemoryServer;
let mockUserId: Types.ObjectId;

beforeAll(async () => {
  db = await MongoMemoryServer.create();
  con = await mongoose.connect(db.getUri(), {});

  const mockUser = await UserModel.create({
    username: "testUser",
    email: "test@test.com",
    password: "password",
  });

  mockUserId = mockUser.id;
});

afterAll(async () => {
  const collections = con.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }

  if (con) {
    await con.disconnect();
  }

  if (db) {
    await db.stop();
  }
});

describe("signToken", () => {
  it("should return a valid JWT token", async () => {
    const mockUser = await UserModel.findById({ _id: mockUserId });

    if (!mockUser) return;

    const token = signToken(mockUser);
    const secret = process.env.JWT_SECRET as string;
    const expiration = process.env.JWT_EXPIRATION;

    const { data } = jwt.verify(token, secret, {
      maxAge: expiration,
    }) as JwtPayload;

    expect(typeof token).toBe("string");
    expect(data).toBeTruthy();
  });
});

describe("authMiddleware", async () => {
  it("should return a user object if token is valid", async () => {
    const mockUser = await UserModel.findById({ _id: mockUserId });

    if (!mockUser) return;

    const token = signToken(mockUser);

    await SessionModel.create({
      user: mockUser.id,
      token,
      expires: new Date(Date.now() + 1000),
    });

    const req = {
      cookies: {
        token,
      },
    } as unknown as Request;

    const res = {} as unknown as Response;

    const { user } = await authMiddleware({
      req,
      res,
    } as unknown as ExpressContextFunctionArgument);

    expect(user).toBeTruthy();
  });

  it("should return req and res objects if token is not present", async () => {
    const req = {
      cookies: {},
    } as unknown as Request;

    const res = {} as unknown as Response;

    const middlewareReturn = await authMiddleware({
      req,
      res,
    } as unknown as ExpressContextFunctionArgument);

    expect(middlewareReturn.req).toBeTruthy();
    expect(middlewareReturn.res).toBeTruthy();
  });

  it("should throw an error if token is invalid", async () => {
    const req = {
      cookies: {},
    } as unknown as Request;

    const res = {
      clearCookie: vi.fn(),
    } as unknown as Response;

    try {
      await authMiddleware({
        req,
        res,
      } as unknown as ExpressContextFunctionArgument);
    } catch (error) {
      expect(error.message).toBe("Token not verified");
    }
  });

  it("should throw an error if JWT is malformed", async () => {
    const req = {
      cookies: {
        token: "invalidToken",
      },
    } as unknown as Request;

    const res = {
      clearCookie: vi.fn(),
    } as unknown as Response;

    try {
      await authMiddleware({
        req,
        res,
      } as unknown as ExpressContextFunctionArgument);
    } catch (error) {
      expect(error.message).toBe("User Not Authorized");
    }
  });

  it("should throw an error if no session exists for the user the token belongs to", async () => {
    const mockUser = await UserModel.findById({ _id: mockUserId });

    if (!mockUser) return;

    const token = signToken(mockUser);

    const req = {
      cookies: {
        token,
      },
    } as unknown as Request;

    const res = {
      clearCookie: vi.fn(),
    } as unknown as Response;

    try {
      await authMiddleware({
        req,
        res,
      } as unknown as ExpressContextFunctionArgument);
    } catch (error) {
      expect(error.message).toBe("Session not found");
    }
  });
  it("should throw an error if the user the session is assigned to does not exist", async () => {
    const mockUser = await UserModel.findOne({ username: "testUser" });

    if (!mockUser) return;

    const id = mockUser.id;

    const token = signToken(mockUser);

    await SessionModel.create({
      user: id,
      token,
      expires: new Date(Date.now() + 1000),
    });

    await UserModel.findByIdAndDelete(id);

    const req = {
      cookies: {
        token,
      },
    } as unknown as Request;

    const res = {
      clearCookie: vi.fn(),
    } as unknown as Response;

    try {
      await authMiddleware({
        req,
        res,
      } as unknown as ExpressContextFunctionArgument);
    } catch (error) {
      expect(error.message).toBe("User Not Authorized");
    }
  });
});

// describe("authMiddleware iINVALID TOKEN", () => {});

afterAll(async () => {
  await SessionModel.deleteMany({ user: mockUserId });

  const user = await UserModel.findById(mockUserId);

  if (user) {
    await UserModel.findByIdAndDelete(mockUserId);
  }
});
