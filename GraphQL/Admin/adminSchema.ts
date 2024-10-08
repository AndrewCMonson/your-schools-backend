import { AuthenticationError } from "apollo-server-express";
import { readFileSync } from "fs";
import { generate } from "generate-password";
import { Resolvers } from "../../__generatedTypes__/graphql.js";
import { SchoolModel, UserModel } from "../../models/index.js";
import { hashPassword, sendRecoveryEmail } from "../../utils/index.js";

export const adminTypeDefs: string = readFileSync(
  "GraphQL/Admin/adminTypeDefs.graphql",
  "utf-8",
);

export const adminResolvers: Resolvers = {
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
  },
};
