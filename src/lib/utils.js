// auth/jwt.js
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

export const generateAccessToken = (userId,orgId) => {
    return jwt.sign(
        { userId: userId, organizationId: orgId }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: "30d" }
    );
};

export const generateResetToken = (userId,orgId) => {
    return jwt.sign(
        { userId: userId, organizationId: orgId }, 
        process.env.RESET_TOKEN_SECRET, 
        { expiresIn: "15m" }
    );
};

export const generateOTP = () => {
    // generates a 6-digit OTP (100000 - 999999)
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const Limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests
    message: {
        message: "Too many password reset requests. Try again later.",
    },
});