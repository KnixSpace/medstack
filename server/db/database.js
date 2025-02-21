import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const DB_URI =
  process.env.NODE_ENV === "development"
    ? process.env.LOCAL_DB_URI
    : process.env.ATLAS_DB_URI;

export const client = new MongoClient(DB_URI);

export const connectDB = async () => {
  try {
    await client.connect();
    console.log("📄 DB connected!");
  } catch (error) {
    console.log("Error in db connection", error.message);
    process.exit(1);
  }
};
