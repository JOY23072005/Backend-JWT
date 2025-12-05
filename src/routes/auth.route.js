import express from "express"
import { changePass, login, requestOTP, signup, verifyLoginOTP, verifyOTP } from "../controllers/auth.controller.js";

const AuthRoutes= express.Router();

AuthRoutes.post("/signup",signup);
AuthRoutes.post("/signup/request-otp",requestOTP);
AuthRoutes.post("/signup/verify-otp",verifyOTP);

AuthRoutes.post("/login",login);
AuthRoutes.post("/login/request-otp",requestOTP);
AuthRoutes.post("/login/verify-otp",verifyLoginOTP);

AuthRoutes.post("/change-password",changePass);

export default AuthRoutes;