import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Types } from "mongoose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { schools } from "../data/index.js";
import { ReviewModel, SchoolModel } from "./index.js";

describe("School Model", () => {
  let con: typeof mongoose;
  let db: MongoMemoryServer;
  let schoolId: Types.ObjectId;

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

  it("should be able to create a new school", async () => {
    const school = await SchoolModel.create(schools[0]);

    if (!school) {
      throw new Error("School not created");
    }

    schoolId = school.id;

    const createdSchool = await SchoolModel.findById({ _id: school.id });

    expect(createdSchool).not.toBe(null);
    expect(createdSchool?.name).toBe(schools[0].name);
    expect(createdSchool?.address).toBe(schools[0].address);
  });

  it("should be able to delete a school", async () => {
    const school = await SchoolModel.findById({
      _id: schoolId,
    });

    if (!school) {
      throw new Error("School not found");
    }

    await SchoolModel.findOneAndDelete({
      _id: school.id,
    });

    const deletedSchool = await ReviewModel.findOne({
      _id: school.id,
    });

    expect(deletedSchool).toBe(null);
  });
});
