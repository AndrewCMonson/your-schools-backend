import { AuthenticationError } from "apollo-server-express";
import { readFileSync } from "fs";
import { Resolvers } from "../../__generatedTypes__/graphql.js";
import { SessionModel, UserModel } from "../../models/index.js";
import { signToken } from "../../utils/index.js";

export const authTypeDefs: string = readFileSync(
  "GraphQL/Auth/authTypeDefs.graphql",
  "utf-8",
);

export const authResolvers: Resolvers = {
  Mutation: {
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
};
