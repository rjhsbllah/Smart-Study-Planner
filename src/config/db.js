import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState;

    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Error:", err);
    throw err;
  }
};

export default connectDB;
