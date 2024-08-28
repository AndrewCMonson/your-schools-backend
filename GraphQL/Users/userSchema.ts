import { AuthenticationError } from "apollo-server-express";
import { readFileSync } from "fs";
import { generate } from "generate-password";
import { Resolvers } from "../../__generatedTypes__/graphql.js";
import { SchoolModel, SessionModel, UserModel } from "../../models/index.js";
import {
  hashPassword,
  sendRecoveryEmail,
  signToken,
} from "../../utils/index.js";

export const userTypeDefs: string = readFileSync(
  "GraphQL/Users/userTypeDefs.graphql",
  "utf-8",
);

export const userResolvers: Resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError("Not logged in");

      return user;
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
  },
};
