import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Types } from "mongoose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { schools, users } from "../data/index.js";
import { ReviewModel, SchoolModel, UserModel } from "./index.js";

describe("Review Model", () => {
  let con: typeof mongoose;
  let db: MongoMemoryServer;
  let schoolId: Types.ObjectId;
  let ownerId: Types.ObjectId;

  beforeAll(async () => {
    db = await MongoMemoryServer.create();
    con = await mongoose.connect(db.getUri(), {});

    const school = await SchoolModel.create(schools[0]);
    const owner = await UserModel.create(users[0]);

    if (!school) {
      throw new Error("School not created");
    }

    if (!owner) {
      throw new Error("Owner not created");
    }

    schoolId = school.id;
    ownerId = owner.id;
  });

  afterAll(async () => {
    if (con) {
      await con.disconnect();
    }

    if (db) {
      await db.stop();
    }
  });

  it("should be able to create a new review", async () => {
    await ReviewModel.create({
      school: schoolId,
      rating: 5,
      review: "This is a review",
      owner: ownerId,
    });

    const review = await ReviewModel.findOne({
      school: schoolId,
    });

    expect(review).not.toBe(null);
    expect(review?.rating).toBe(5);
    expect(review?.review).toBe("This is a review");
    expect(review?.owner).toBe(review?.owner);
  });

  it("should be able to delete a review", async () => {
    const review = await ReviewModel.findOne({
      school: schoolId,
    });

    if (!review) {
      throw new Error("Review not found");
    }

    await ReviewModel.findOneAndDelete({
      _id: review.id,
    });

    const deletedReview = await ReviewModel.findOne({
      _id: review.id,
    });

    expect(deletedReview).toBe(null);
  });
});
