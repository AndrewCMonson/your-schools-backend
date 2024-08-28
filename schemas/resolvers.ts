import {
  SchoolModel,
  UserModel,
  SessionModel,
  ReviewModel,
} from "../models/index.js";
import { AuthenticationError } from "apollo-server-express";
import { signToken, hashPassword, sendRecoveryEmail } from "../utils/index.js";
import { Resolvers } from "../__generatedTypes__/graphql.js";
import { getLatLng, getLatLngFromZipcode } from "../services/index.js";
import { generate } from "generate-password";
import Void from "./scalars.js";

const resolvers: Resolvers = {
  Query: {
    schools: async (_, { zipcode }) => {
      if (!zipcode) {
        return { schools: [] };
      }
      const schools = await SchoolModel.find({ zipcode: zipcode });

      const locationInfo = await getLatLngFromZipcode(zipcode);

      return { schools, locationInfo };
    },
    allSchools: async () => {
      const schools = await SchoolModel.find();

      return schools;
    },
    school: async (_, { id }) => {
      if (!id) throw new Error("Please provide an ID");

      const school = await SchoolModel.findById(id);

      if (!school) {
        throw new Error("No school found with this ID");
      }

      return school;
    },
    me: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError("Not logged in");

      return user;
    },
    getFavorites: async (_, { username }) => {
      if (!username) throw new Error("Please provide a username");

      const params = username ? { username } : {};
      return UserModel.find(params).populate("favorites");
    },
    allUsers: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError("You need to be logged in");

      if (!user.isAdmin)
        throw new AuthenticationError("You need to be an admin to view users");

      const users = await UserModel.find();

      return users;
    },
  },
  User: {
    favorites: async (parent) => {
      const favorites = await SchoolModel.find({
        _id: { $in: parent.favoriteIds },
      });

      return favorites;
    },
  },
  School: {
    latLng: async (parent) => {
      const { address, city, state } = parent;
      const { lat, lng } = await getLatLng(address, city, state);
      return { lat, lng };
    },
    reviews: async (parent) => {
      const reviews = await ReviewModel.find({ _id: { $in: parent.reviews } });

      if (!reviews) {
        throw new Error("No reviews found for this school");
      }

      return reviews;
    },
  },
  Review: {
    owner: async (parent) => {
      const owner = await UserModel.findById(parent.owner);

      if (!owner) {
        throw new Error("No user found for this review");
      }

      return owner;
    },
  },
  Mutation: {
    addUser: async (_, { username, email, password }, { res }) => {
      if (!username || !email || !password) {
        throw new AuthenticationError(
          "You need to provide a username, email, and password",
        );
      }

      const user = await UserModel.create({ username, email, password });
      const token = signToken(user);

      await SessionModel.create({
        user: user.id,
        token,
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 3,
      });

      return { token, user };
    },
    updateUserInfo: async (
      _,
      { username, email, zipcode, theme },
      { user },
    ) => {
      if (!user) throw new AuthenticationError("You need to be logged in");

      const updatedUser = await UserModel.findByIdAndUpdate(
        { _id: user.id },
        { username, email, zipcode, theme },
        { new: true },
      );

      if (!updatedUser) {
        throw new AuthenticationError("Couldn't find user with this id");
      }

      return updatedUser;
    },
    updateUserPassword: async (_, { password, newPassword }, { user }) => {
      if (!user) throw new AuthenticationError("You need to be logged in");

      const loggedInUser = await UserModel.findById(user.id);

      if (!loggedInUser) {
        throw new AuthenticationError("Couldn't find user with this id");
      }

      if (password === "" || newPassword === "") {
        throw new AuthenticationError(
          "You need to provide a password and a new password",
        );
      }

      if (password === newPassword) {
        throw new AuthenticationError("New password cannot be the same");
      }

      const correctPw = await loggedInUser.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect password");
      }

      const hashedPassword = await hashPassword(newPassword);

      const updatedUser = await UserModel.findByIdAndUpdate(
        { _id: user.id },
        { password: hashedPassword },
        { new: true },
      );

      if (!updatedUser) {
        throw new AuthenticationError("Couldn't find user with this id");
      }

      return updatedUser;
    },
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
    deleteUser: async (_, { id }, { user }) => {
      if (!id) throw new Error("Please provide a user ID");

      if (!user) throw new AuthenticationError("You need to be logged in");

      if (!user.isAdmin)
        throw new AuthenticationError(
          "You need to be an admin to delete a user",
        );

      const deletedUser = await UserModel.findByIdAndDelete(id);

      if (!deletedUser) {
        throw new Error("Couldn't find user with this id");
      }

      return "User deleted successfully";
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
    addToFavorites: async (_, { schoolId }, { user }) => {
      if (!schoolId) throw new Error("Please provide a school ID");

      if (!user) throw new AuthenticationError("You need to be logged in");

      const updatedUser = await UserModel.findOneAndUpdate(
        { _id: user.id },
        { $addToSet: { favoriteIds: schoolId } },
        { new: true },
      );

      if (!updatedUser) {
        throw new AuthenticationError("Couldn't find user with this id");
      }

      return updatedUser;
    },
    removeFromFavorites: async (_, { schoolId }, { user }) => {
      if (user) {
        const updatedUser = await UserModel.findByIdAndUpdate(
          { _id: user.id },
          { $pull: { favoriteIds: schoolId } },
          { new: true },
        );

        if (!updatedUser) {
          throw new AuthenticationError("Couldn't find user with this id");
        }

        return updatedUser.id;
      }

      throw new AuthenticationError("You need to be logged in!");
    },
    recoverPassword: async (_, { email }) => {
      if (!email) throw new Error("Please provide an email");

      const user = await UserModel.findOne({ email });

      if (!user) throw new Error("No user found with this email");

      const tempPassword = generate({
        length: 6,
        numbers: true,
      });

      const hashedPassword = await hashPassword(tempPassword);

      await UserModel.findByIdAndUpdate(
        { _id: user.id },
        { password: hashedPassword },
        { new: true },
      );

      await sendRecoveryEmail(email, tempPassword);

      return "Email sent with temporary password";
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
    addSchool: async (_, { name, address, city, state, zipcode }, { user }) => {
      if (!name || !address || !city || !state || !zipcode) {
        throw new Error(
          "You need to provide a name, address, city, state, and zipcode",
        );
      }

      if (!user) throw new AuthenticationError("You need to be logged in");

      if (!user.isAdmin)
        throw new AuthenticationError(
          "You need to be an admin to add a school",
        );

      const newSchool = await SchoolModel.create({
        name,
        address,
        city,
        state,
        zipcode,
      });

      return newSchool;
    },
    deleteSchool: async (_, { id }, { user }) => {
      if (!id) throw new Error("Please provide a school ID");

      if (!user) throw new AuthenticationError("You need to be logged in");

      if (!user.isAdmin)
        throw new AuthenticationError(
          "You need to be an admin to delete a school",
        );

      const deletedSchool = await SchoolModel.findByIdAndDelete(id);

      if (!deletedSchool) {
        throw new Error("Couldn't find school with this id");
      }

      return "School deleted successfully";
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
