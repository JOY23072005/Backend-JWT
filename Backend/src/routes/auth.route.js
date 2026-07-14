import express from "express"
import { changePass, login, logout, refresh, requestOtp, resetPass, signup, verifyOtp } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { Limiter } from "../lib/utils/limiter.js";

const AuthRoutes= express.Router();

// simple authentication
AuthRoutes.post("/signup",signup);
AuthRoutes.post("/login",login);
AuthRoutes.post("/logout",logout);

// verifying mail
AuthRoutes.post("/request-otp",requestOtp);
AuthRoutes.post("/verify-otp",verifyOtp);

// changing password using old password
AuthRoutes.post("/change-password",protectRoute,changePass);

// forget and reset password
AuthRoutes.post("/reset-password",resetPass);

// refresh access token
AuthRoutes.post("/refresh-token",refresh);

export default AuthRoutes;