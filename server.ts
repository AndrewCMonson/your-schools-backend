import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./schemas/index";
import { authMiddleware } from "./utils/auth";
import { BaseContext } from "@apollo/server";
import cookieParser from "cookie-parser";

const PORT = process.env.PORT || 3005;

const corsOptions = {
  origin: [`${process.env.CLOUDFRONT_URL}`, "http://localhost:5173"],
  credentials: true,
};

const startServer = async () => {
  const app = express();
  const server = new ApolloServer<BaseContext>({
    typeDefs,
    resolvers,
  });
  await server.start();

  app.use(
    "/graphql",
    express.json(),
    cors(corsOptions),
    cookieParser(),
    express.urlencoded({ extended: true }),
    expressMiddleware(server, {
      context: authMiddleware,
    }),
  );

  connectDB();

  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
};

startServer();
