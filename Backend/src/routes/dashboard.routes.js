import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { getDashboard } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get(
  "/",
  protectRoute,
  authorize("admin","sub-admin"),
  getDashboard
);

export default router;