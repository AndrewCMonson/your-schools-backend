import { AuthenticationError } from "apollo-server-express";
import { readFileSync } from "fs";
import { Resolvers } from "../../__generatedTypes__/graphql.js";
import { ReviewModel, SchoolModel } from "../../models/index.js";

export const reviewTypeDefs: string = readFileSync(
  "GraphQL/Reviews/reviewTypeDefs.graphql",
  "utf-8",
);

export const reviewResolvers: Resolvers = {
  Mutation: {
    addReview: async (_, { rating, review, schoolId }, { user }) => {
      if (!user) throw new AuthenticationError("You need to be logged in");

      const userReviews = await ReviewModel.find({ owner: user.id });

      const hasReviewed = userReviews.some(
        (userReview) => userReview.school.toString() === schoolId,
      );

      if (hasReviewed) {
        throw new Error("You have already reviewed this school");
      }

      const newReview = await ReviewModel.create({
        rating,
        review,
        owner: user.id,
        school: schoolId,
      });

      await SchoolModel.findByIdAndUpdate(
        { _id: schoolId },
        { $addToSet: { reviews: newReview.id } },
        { new: true },
      );

      const averageRating = await ReviewModel.aggregate([
        {
          $group: {
            _id: null,
            average: { $avg: "$rating" },
          },
        },
      ]);

      await SchoolModel.findByIdAndUpdate(
        {
          _id: schoolId,
        },
        {
          rating: averageRating[0].average,
        },
        { new: true },
      );

      return newReview;
    },
  },
};
