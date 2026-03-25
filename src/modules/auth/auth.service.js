import * as db_service from "../../DB/db.service.js";
import authModel from "../../DB/models/auth.model.js";
import blacklistTokenModel from "../../DB/models/blacklistToken.model.js";
import cloudinary from "../../common/utils/cloudinary.js";
import successResponse from "../../common/utils/response.success.js";
import { GenerateToken } from "../../common/utils/token.service.js";
import { Hash, Compare } from "../../common/utils/security/hash.security.js";
import {
  SALT_ROUNDS,
  ACCESS_SECRET_KEY,
  REFRESH_SECRET_KEY,
} from "../../../config/config.service.js";
import { randomUUID } from "node:crypto";
import { sendEmail } from "../../common/utils/email.service.js";

export const signUp = async (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword, gender, age } =
    req.body;

  if (password !== confirmPassword) {
    return next(new Error("Password not match", { cause: 400 }));
  }
  if (
    await db_service.findOne({
      model: authModel,
      filter: { email },
    })
  ) {
    return next(new Error("Email already exists", { cause: 400 }));
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
  );

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const auth = await db_service.create({
    model: authModel,
    data: {
      firstName,
      lastName,
      email,
      password: Hash({ plain_text: password, salt_rounds: SALT_ROUNDS }),
      gender,
      age,
      profilePicture: { secure_url, public_id },
      isVerified: false,
      otp: {
        code: Hash({ plain_text: otpCode, salt_rounds: SALT_ROUNDS }),
        expiresAt: otpExpiry,
      },
    },
  });

  await sendEmail({
    to: email,
    subject: "Verify your Onsy account",
    html: `
        <h2>Welcome to Onsy, ${firstName}!</h2>
        <p>Your verification code is:</p> 
        <h1 style="color: #4F46E5;">${otpCode}</h1>
        <p>This code expires in <strong>10 minutes</strong>.</p>
      `,
  });

  successResponse({
    res,
    status: 201,
    message: "Successful signUp",
    data: auth,
  });
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const auth = await db_service.findOne({
      model: authModel,
      filter: { email },
    });
    if (!auth) {
      return next(new Error("Email not found", { cause: 404 }));
    }

    if (auth.isVerified) {
      return next(new Error("Account already verified", { cause: 400 }));
    }
    if (auth.otp.expiresAt < new Date()) {
      return next(new Error("OTP expired", { cause: 400 }));
    }

    if (!Compare({ plain_text: otp, cipher_text: auth.otp.code })) {
      return next(new Error("Invalid OTP", { cause: 400 }));
    }

    await db_service.update({
      model: authModel,
      filter: { email },
      update: { isVerified: true, otp: null },
    });

    successResponse({
      res,
      status: 200,
      message: "Account verified successfully!",
    });
  } catch (error) {
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const auth = await db_service.findOne({
    model: authModel,
    filter: { email },
  });
  if (!auth) {
    return next(new Error("Email not found", { cause: 400 }));
  }

  if (!auth.isVerified) {
    return next(new Error("Please verify your email first", { cause: 403 }));
  }

  if (!Compare({ plain_text: password, cipher_text: auth.password })) {
    return next(new Error("Password not match", { cause: 400 }));
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

export const signOut = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

  await db_service.create({
    model: blacklistTokenModel,
    data: {
      token,
    },
  });

  successResponse({
    res,
    status: 200,
    message: "Successful signOut",
  });
};

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  const auth = await db_service.findOne({
    model: authModel,
    filter: { email },
  });
  if (!auth) {
    return next(new Error("Email not found", { cause: 404 }));
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await db_service.update({
    model: authModel,
    filter: { email },
    update: {
      otp: {
        code: Hash({ plain_text: otpCode, salt_rounds: SALT_ROUNDS }),
        expiresAt: otpExpiry,
      },
      isOtpVerified: false,
    },
  });

  await sendEmail({
    to: email,
    subject: "Reset your Onsy password",
    html: `
      <h2>Hello ${auth.firstName}!</h2>
      <p>Your password reset code is:</p>
      <h1 style="color: #4F46E5;">${otpCode}</h1>
      <p>This code expires in <strong>10 minutes</strong>.</p>
    `,
  });

  successResponse({ res, status: 200, message: "OTP sent to your email" });
};

export const verifyForgetPasswordOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  const auth = await db_service.findOne({
    model: authModel,
    filter: { email },
  });
  if (!auth) {
    return next(new Error("Email not found", { cause: 404 }));
  }

  if (auth.otp.expiresAt < new Date()) {
    return next(new Error("OTP expired", { cause: 400 }));
  }

  if (!Compare({ plain_text: otp, cipher_text: auth.otp.code })) {
    return next(new Error("Invalid OTP", { cause: 400 }));
  }

  await db_service.update({
    model: authModel,
    filter: { email },
    update: { isOtpVerified: true, otp: null },
  });

  successResponse({ res, status: 200, message: "OTP verified successfully" });
};

export const resetPassword = async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(new Error("Passwords do not match", { cause: 400 }));
  }

  const auth = await db_service.findOne({
    model: authModel,
    filter: { email },
  });
  if (!auth) {
    return next(new Error("Email not found", { cause: 404 }));
  }

  if (!auth.isOtpVerified) {
    return next(new Error("Please verify OTP first", { cause: 403 }));
  }

  await db_service.update({
    model: authModel,
    filter: { email },
    update: {
      password: Hash({ plain_text: password, salt_rounds: SALT_ROUNDS }),
      isOtpVerified: false,
    },
  });

  successResponse({ res, status: 200, message: "Password reset successfully" });
};
