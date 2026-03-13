import * as db_service from "../../DB/db.service.js";
import authModel from "../../DB/models/auth.model.js";
import cloudinary from "../../common/utils/cloudinary.js";
import successResponse from "../../common/utils/response.success.js";
import { GenerateToken } from "../../common/utils/token.service.js";
import {
  ACCESS_SECRET_KEY,
  REFRESH_SECRET_KEY,
} from "../../../config/config.service.js";
import { randomUUID } from "node:crypto";

export const signUp = async (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword, gender, age } =
    req.body;

  if (password !== confirmPassword) {
    throw new Error("Password not match");
  }
  if (
    await db_service.findOne({
      model: authModel,
      filter: { email },
    })
  ) {
    throw new Error("Email already exists");
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
  );

  const auth = await db_service.create({
    model: authModel,
    data: {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      gender,
      age,
      profilePicture: { secure_url, public_id },
    },
  });
  successResponse({
    res,
    status: 201,
    message: "Successful signUp",
    data: auth,
  });
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const auth = await db_service.findOne({
    model: authModel,
    filter: { email },
  });
  if (!auth) {
    throw new Error("Email not found");
  }
  if (auth.password !== password) {
    throw new Error("Password not match");
  }

  const jwtid = randomUUID();
  const access_token = GenerateToken({
    payload: { id: auth._id, email: auth.email },
    secret_key: ACCESS_SECRET_KEY,
    options: { expiresIn: "1h", jwtid },
  });

  const refresh_token = GenerateToken({
    payload: { id: auth._id, email: auth.email },
    secret_key: REFRESH_SECRET_KEY,
    options: { expiresIn: "7d", jwtid },
  });

  successResponse({
    res,
    status: 200,
    message: "Successful signIn",
    data: { access_token, refresh_token },
  });
};
