import express from "express";

import {protectRoute} from "../middleware/auth.middleware.js";
import {authorize} from "../middleware/authorize.middleware.js";

import {
  claimReward,
  createRedemption,
  getMyRedemptions,
} from "../controllers/redemption.controller.js";

const router = express.Router();

router.post(
  "/create/:rewardId",
  protectRoute,
  createRedemption
);

router.post(
  "/claim/:redemptionId",
  protectRoute,
  authorize("admin","sub-admin","staff"),
  claimReward
);

router.get(
  "/my",
  protectRoute,
  getMyRedemptions
);

export default router;