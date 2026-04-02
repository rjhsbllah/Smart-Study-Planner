import mongoose from "mongoose";
import "dotenv/config";

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDb");
  })
  .catch((err) => {
    console.log(err);
  });

export default mongoose;
