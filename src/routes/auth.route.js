import express from "express"
import { changePass, forgotPass, login, requestOTP, resetPass, signup, verifyOTP } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const AuthRoutes= express.Router();

// simple authentication
AuthRoutes.post("/signup",signup);
AuthRoutes.post("/login",login);

// verifying mail
AuthRoutes.post("/request-otp",requestOTP);
AuthRoutes.post("/verify-otp",verifyOTP);

// changing password using old password
AuthRoutes.post("/change-password",protectRoute,changePass);

// forget and reset password
AuthRoutes.post("/forgot-password",forgotPass)
AuthRoutes.post("/reset-password",resetPass)
export default AuthRoutes;