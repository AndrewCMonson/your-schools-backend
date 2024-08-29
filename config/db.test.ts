import { connectDB } from "./db.js";
import mongoose from "mongoose";
import { describe, it, expect, afterAll, vi } from "vitest";

describe("connectDB", () => {
  const consoleMock = vi
    .spyOn(console, "log")
    .mockImplementation(() => undefined);

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should connect to the database", async () => {
    await connectDB();
    expect(mongoose.connection.readyState).toBe(1);
    expect(consoleMock).toBeCalledWith(
      `MongoDB Connected: ${mongoose.connection.host}`,
    );
  });
});
