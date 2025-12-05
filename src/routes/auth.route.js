import express from "express"

const AuthRoutes= express.Router();

AuthRoutes.post("/signup",(req,res)=>{
    res.send("Signup")
});
AuthRoutes.post("/signup/request-otp",(req,res)=>{
    res.send("otp-request")
});
AuthRoutes.post("/signup/verify-otp",(req,res)=>{
    res.send("otp-verified")
});

AuthRoutes.post("/login",(req,res)=>{
    res.send("login")
});
AuthRoutes.post("/login/request-otp",(req,res)=>{
    res.send("otp-request")
});
AuthRoutes.post("/login/verify-otp",(req,res)=>{
    res.send("otp-verified")
});

AuthRoutes.post("/logout",(req,res)=>{})

AuthRoutes.post("/change-password",(req,res)=>{
    res.send("password Changed")
});

export default AuthRoutes;