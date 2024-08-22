import process from "process";
import jwt from "jsonwebtoken";
import { ContextFunction } from "@apollo/server";
import { ExpressContextFunctionArgument } from "@apollo/server/express4";
import { UserAttributes, UserModel, SessionModel } from "../models/index";
import { Response, Request } from "express";
import { Secret } from "jsonwebtoken";

const secret = process.env.JWT_SECRET as Secret;
const expiration = process.env.JWT_EXPIRATION;

export interface MyContext {
  user?: UserAttributes | null;
  res: Response;
  req: Request;
}

interface JwtPayload {
  data: {
    username: string;
    id: string;
  };
}

export const signToken = (user: UserAttributes) => {
  const data = {
    username: user.username,
    id: user.id,
  };
  return jwt.sign({ data }, secret, { expiresIn: expiration });
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
    }) as JwtPayload;

    if (!data) {
      throw new Error("Token not verified");
    }

    // fetch session with matching token
    const session = await SessionModel.findOne({
      token,
    });

    // if session is not found, throw error
    if (!session) {
      console.log("Session not found", token);
      throw new Error("Session not found");
    }
    // if session is expired, throw error

    const user = await UserModel.findOne({
      _id: session.user,
    }).select("-__v -password");

    if (!user) {
      throw new Error("User Not authorized");
    }

    return { user, res, req };
  } catch (error) {
    console.error(error);
    res.clearCookie("token");
    throw new Error("User Not Authorized");
  }
};
