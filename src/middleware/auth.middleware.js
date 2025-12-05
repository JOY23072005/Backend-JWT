import jwt from "jsonwebtoken"

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.body.token;

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized - No Token Provided"
            });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // decoded = { userId: "693346...", orgId: "...", iat:..., exp:... }

        if (!decoded?.userId) {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.userId = decoded.userId; // <== correct way

        next();

    } catch (error) {
        console.log("Error in protectRoute", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
