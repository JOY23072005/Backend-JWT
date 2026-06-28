import express from "express"
import {
  getRewards,
  createReward,
  updateReward,
  deleteReward,
  deactivateReward,
  activateReward,
  uploadRewardsCSV,
} from "../controllers/reward.controller.js";

import {protectRoute} from "../middleware/auth.middleware.js";
import {authorize} from "../middleware/authorize.middleware.js"
import {uploadCSV} from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getRewards);

router.post(
  "/",  
  protectRoute, 
  authorize('admin','sub-admin'),
  createReward
);

router.patch(
  "/:rewardId",  
  protectRoute, 
  authorize('admin','sub-admin'),
  updateReward);

router.delete("/:rewardId",  
  protectRoute, 
  authorize('admin','sub-admin'),
  deleteReward);

router.patch(
  "/:rewardId/deactivate",
  protectRoute,
  authorize('admin','sub-admin'),
  deactivateReward
);

router.patch(
  "/:rewardId/activate",
  protectRoute,
  authorize('admin','sub-admin'),
  activateReward
);

router.post(
   "/upload-csv",
   protectRoute,
   authorize('admin','sub-admin'),
   uploadCSV,
   uploadRewardsCSV
);

export default router;