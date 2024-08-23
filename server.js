import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./schemas/index";
import { authMiddleware } from "./utils/auth";
import cookieParser from "cookie-parser";
import { AWSSecretsRetrieval } from "./env.config";
const { CLOUDFRONT_URL } = await AWSSecretsRetrieval();
const PORT = process.env.PORT || 3005;
const corsOptions = {
    origin: [
        `https://${process.env.CLOUDFRONT_URL}`,
        "https://localhost:5173",
        `https://${CLOUDFRONT_URL}`,
    ],
    credentials: true,
};
const startServer = async () => {
    const app = express();
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });
    await server.start();
    app.use("/graphql", express.json(), cors(corsOptions), cookieParser(), express.urlencoded({ extended: true }), expressMiddleware(server, {
        context: authMiddleware,
    }));
    connectDB();
    app.listen(PORT, () => {
        console.log(`Server listening on ${PORT}`);
    });
};
startServer();
