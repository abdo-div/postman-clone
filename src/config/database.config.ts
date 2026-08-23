import mongoose from "mongoose";
import { env } from "./env.config.js";

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri =
      env.MONGO_URI || process.env.MONGO_URI || "mongodb://localhost:27017/postman-clone";

    const options: mongoose.ConnectOptions = {};
    if (env.DB_NAME) {
      options.dbName = env.DB_NAME;
    }

    await mongoose.connect(mongoUri, options);
    console.log(`Connected to MongoDB database: "${mongoose.connection.name}"`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with an error code
  }
};
