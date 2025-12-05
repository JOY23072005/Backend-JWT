import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { updateProfile,getDetails } from "../controllers/user.controller.js";

const UserRoutes= express.Router();

UserRoutes.put("/update-profile",protectRoute,updateProfile)

UserRoutes.get("/details",protectRoute,getDetails)

export default UserRoutes;