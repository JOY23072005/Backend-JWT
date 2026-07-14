import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { updateProfile,getDetails, uploadProfileImage } from "../controllers/user.controller.js";
import { uploadSingleImage } from "../middleware/upload.middleware.js";

const UserRoutes= express.Router();

UserRoutes.put("/update-profile",protectRoute,updateProfile);
UserRoutes.put("/profile-image",protectRoute,uploadSingleImage,uploadProfileImage);

UserRoutes.get("/details",protectRoute,getDetails)

export default UserRoutes;