// auth/jwt.js
import jwt from "jsonwebtoken";

export const generateAccessToken = (userId,orgId) => {
    return jwt.sign(
        { userId, organizationId: orgId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30d" }
    );
};


export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        return null;
    }
};

export const generateOTP = () => {
    // generates a 6-digit OTP (100000 - 999999)
    return Math.floor(100000 + Math.random() * 900000).toString();
};
