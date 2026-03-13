import { Router } from "express";
import { multer_host } from "../../common/middleware/multer.js";
import { validation } from "../../common/middleware/validation.js";
import * as AV from "./auth.validation.js";
import * as AS from "./auth.service.js";
import { authentication } from "../../common/middleware/authentication.js";
const authRouter = Router();

authRouter.post(
  "/signup",
  multer_host().single("profilePicture"),
  validation(AV.signUpSchema),
  AS.signUp,
);

authRouter.post("/signin", validation(AV.signInSchema), AS.signIn);
authRouter.post("/signout", authentication, AS.signOut);
authRouter.post("/verify-otp", validation(AV.verifyOtpSchema), AS.verifyOtp);

export default authRouter;
