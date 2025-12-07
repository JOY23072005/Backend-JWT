import express from "express"
import { changePass, login, requestOTP, signup, verifyOTP } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const AuthRoutes= express.Router();

AuthRoutes.post("/signup",signup);
AuthRoutes.post("/login",login);

AuthRoutes.post("/request-otp",requestOTP);
AuthRoutes.post("/verify-otp",verifyOTP);

AuthRoutes.post("/change-password",protectRoute,changePass);

export default AuthRoutes;