import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./schemas/index";
import { authMiddleware } from "./utils/auth";
import { BaseContext } from "@apollo/server";
import cookieParser from "cookie-parser";
import { AWSSecretsRetrieval } from "./services";

const { CLOUDFRONT_URL } = await AWSSecretsRetrieval();

const PORT = process.env.PORT || 3005;

const corsOptions = {
  origin: [
    `http://${process.env.CLOUDFRONT_URL}`,
    "http://localhost:5173",
    `http://${CLOUDFRONT_URL}`,
    `https://www.yourschools.co`,
    `https://yourschools.co`,
    `http://www.yourschools.co`,
    `http://yourschools.co`,
  ],
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

  app.get("/health", (_, res) => {
    res.status(200).send("Server is running");
  });
};

startServer();
