import express from "express"
import { changePass, login, requestOtp, resetPass, signup, verifyOtp } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { Limiter } from "../lib/utils.js";

const AuthRoutes= express.Router();

// simple authentication
AuthRoutes.post("/signup",signup);
AuthRoutes.post("/login",login);

// verifying mail
AuthRoutes.post("/request-otp",Limiter,requestOtp);
AuthRoutes.post("/verify-otp",verifyOtp);

// changing password using old password
AuthRoutes.post("/change-password",protectRoute,changePass);

// forget and reset password
AuthRoutes.post("/reset-password",resetPass)
export default AuthRoutes;