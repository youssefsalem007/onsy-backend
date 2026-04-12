import express from "express";
import cors from "cors";
import { PORT } from "../config/config.service.js";
import checkConnectionDB from "./DB/connectionDB.js";
import authRouter from "./modules/auth/auth.controller.js";
import userRouter from "./modules/user/user.controller.js";
import { connectionRedis } from "./DB/redis/redis.connection.js";
const app = express();
const port = PORT;

const bootstrap = () => {
  app.use(cors(), express.json());

  app.get("/", (req, res, next) => {
    res.status(200).json({ message: "welcome to onsy" });
  });

  app.use("/auth", authRouter)
  app.use("/user", userRouter)

  checkConnectionDB()
  connectionRedis()

  app.use("/*demo", (req, res, next) => {
    throw new Error(`invalid url ${req.originalUrl}`, { cause: 404 });
  });
  app.use((err, req, res, next) => {
    res
      .status(err.cause || 500)
      .json({ message: err.message, stack: err.stack });
  });

  app.listen(port, () => {
    console.log(`server is running on port ${port}`);
  });
};
export default bootstrap;
