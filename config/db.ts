import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoURI = process.env.MONGO_URI ?? "undefined";

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: unknown) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;
