import dotenv from "dotenv";
import mongoose from "mongoose";
import { AWSSecretsRetrieval } from "../services/index.js";
dotenv.config();

const { MONGO_URI } = await AWSSecretsRetrieval();

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGO_URI ?? process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};
