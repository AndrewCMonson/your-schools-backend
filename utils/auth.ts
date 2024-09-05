import { ContextFunction } from "@apollo/server";
import { ExpressContextFunctionArgument } from "@apollo/server/express4";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { SessionModel, UserAttributes, UserModel } from "../models/index.js";
import { AWSSecretsRetrieval } from "../services/index.js";

export interface MyContext {
  user?: UserAttributes | null;
  res: Response;
  req: Request;
}

export interface CustomPayload {
  data: {
    username: string;
    id: string;
  };
}

const { JWT_SECRET: secret, JWT_EXPIRATION: expiration } =
  await AWSSecretsRetrieval();

export const signToken = (user: UserAttributes) => {
  const data = {
    username: user.username,
    id: user.id,
  };
  return jwt.sign({ data }, secret ?? process.env.JWT_SECRET, {
    expiresIn: expiration ?? process.env.JWT_EXPIRATION,
  });
};

export const authMiddleware: ContextFunction<
  [ExpressContextFunctionArgument],
  MyContext
> = async ({
  req,
  res,
}: ExpressContextFunctionArgument): Promise<MyContext> => {
  const token = req.cookies.token;

  if (!token) {
    return { res, req };
  }

  try {
    const { data } = jwt.verify(token, secret, {
      maxAge: expiration,
    }) as CustomPayload;

    if (!data) {
      throw new Error("Token not verified");
    }

    const session = await SessionModel.findOne({
      token,
    });

    if (!session) {
      console.log("Session not found", token);
      throw new Error("Session not found");
    }

    const user = await UserModel.findOne({
      _id: session.user,
    }).select("-__v -password");

    if (!user) {
      throw new Error("User Not authorized");
    }

    return { user, res, req };
  } catch (error) {
    // console.error(error);
    res.clearCookie("token");
    throw new Error("User not authorized");
  }
};
