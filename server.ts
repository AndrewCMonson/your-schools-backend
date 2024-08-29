import { ApolloServer, BaseContext } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { connectDB } from "./config/db.js";
import { schema } from "./GraphQL/schema.js";
import { AWSSecretsRetrieval } from "./services/index.js";
import { authMiddleware } from "./utils/auth.js";

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
    schema,
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
