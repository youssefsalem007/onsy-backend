import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";

const checkConnectionDB = async () => {
  await mongoose
    .connect(DB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      console.log("db connected");
    })
    .catch((error) => {
      console.log(error);
    });
};

export default checkConnectionDB;
