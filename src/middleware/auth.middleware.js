import jwt from "jsonwebtoken"
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // console.log(authHeader);

        if (!authHeader)
            return res.status(401).json({ message: "Unauthorized access" });

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!decoded?.userId) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        if (
            user.passwordChangedAt &&
            decoded.iat * 1000 < user.passwordChangedAt.getTime()
        ) {
            return res.status(401).json({
                message: "Password changed. Please login again."
            });
        }

        req.userId = decoded.userId; // <== correct way

        next();

    } catch (error) {
        console.log("Error in protectRoute", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
