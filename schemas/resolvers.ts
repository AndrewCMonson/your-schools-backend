import { AuthenticationError } from "apollo-server-express";
import { generate } from "generate-password";
import { Resolvers } from "../__generatedTypes__/graphql.js";
import {
  ReviewModel,
  SchoolModel,
  SessionModel,
  UserModel,
} from "../models/index.js";
import { hashPassword, sendRecoveryEmail, signToken } from "../utils/index.js";
import Void from "./scalars.js";

const resolvers: Resolvers = {
  Query: {},

  Mutation: {
    adminUpdateUserInfo: async (
      _,
      { id, username, email, zipcode, theme, isAdmin },
      { user },
    ) => {
      if (!id) throw new Error("Please provide a user ID");

      if (!user) throw new AuthenticationError("You need to be logged in");

      if (!user.isAdmin)
        throw new AuthenticationError(
          "You need to be an admin to update a user",
        );

      const updatedUser = await UserModel.findByIdAndUpdate(
        { _id: id },
        { username, email, zipcode, theme, isAdmin },
        { new: true },
      );

      if (!updatedUser) {
        throw new Error("Couldn't find user with this id");
      }

      return updatedUser;
    },
    adminAddUser: async (_, { username, email, isAdmin }, { user }) => {
      if (!user) throw new AuthenticationError("You need to be logged in");

      if (!user.isAdmin)
        throw new Error(
          "You need to be an admin to add a user via the admin dashboard",
        );

      if (!username || !email) {
        throw new Error("You need to provide a username and email");
      }

      const tempPassword = generate({
        length: 6,
        numbers: true,
      });

      const hashedPassword = await hashPassword(tempPassword);

      const newUser = await UserModel.create({
        username,
        email,
        isAdmin,
        password: hashedPassword,
      });

      await sendRecoveryEmail(email, tempPassword);

      return newUser;
    },
    login: async (_, { email, password }, { req, res, user }) => {
      if (user) {
        return { user: user, token: req.cookies.token };
      }

      if (!email || !password) {
        throw new AuthenticationError(
          "You need to provide an email and password",
        );
      }

      const loggedInUser = await UserModel.findOne({ email });
      if (!loggedInUser) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await loggedInUser.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(loggedInUser);

      await SessionModel.create({
        user: loggedInUser.id,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 3),
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 3,
      });

      return { token, user: loggedInUser };
    },

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
    updateSchoolInfo: async (
      _,
      {
        id,
        name,
        address,
        city,
        state,
        zipcode,
        phone,
        website,
        email,
        description,
        rating,
        offers_daycare,
        age_range,
        early_enrollment,
        min_tuition,
        max_tuition,
        days_open,
        days_closed,
        opening_hours,
        closing_hours,
        min_enrollment,
        max_enrollment,
        min_student_teacher_ratio,
        max_student_teacher_ratio,
        avatar,
        isVerified,
      },
      { user },
    ) => {
      if (!id) throw new Error("Please provide a school ID");

      if (!user) throw new AuthenticationError("You need to be logged in");

      if (!user.isAdmin)
        throw new AuthenticationError("You need to be an admin");

      const updatedSchool = await SchoolModel.findByIdAndUpdate(
        { _id: id },
        {
          name,
          address,
          city,
          state,
          zipcode,
          phone,
          website,
          email,
          description,
          rating,
          offers_daycare,
          age_range,
          early_enrollment,
          min_tuition,
          max_tuition,
          days_open,
          days_closed,
          opening_hours,
          closing_hours,
          min_enrollment,
          max_enrollment,
          min_student_teacher_ratio,
          max_student_teacher_ratio,
          avatar,
          isVerified,
        },
        { new: true },
      );

      if (!updatedSchool) {
        throw new Error("Couldn't find school with this id");
      }

      return updatedSchool;
    },

    logout: async (_, __, { user, res, req }): Promise<void> => {
      if (user) {
        try {
          await SessionModel.findOneAndDelete({ token: req.cookies.token });
          res.clearCookie("token");
          // return;
        } catch (error) {
          console.error(error);
          throw new Error("Error logging out");
        }
      }
    },
  },
  Void,
};

export default resolvers;
