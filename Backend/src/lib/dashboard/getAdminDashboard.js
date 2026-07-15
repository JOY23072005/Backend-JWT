import Organization from "../../models/organization.model.js";
import User from "../../models/user.model.js";
import RewardCatalog from "../../models/rewardCatalog.model.js";
import Challenge from "../../models/challenge.model.js";
import Redemption from "../../models/redemption.model.js";

export const getAdminDashboard = async () => {
  const now = new Date();

  const [
    organizations,
    subAdmins,
    staff,
    employees,
    rewards,
    activeChallenges,
    pendingRedemptions,
  ] = await Promise.all([
    Organization.countDocuments({
      isActive: true,
    }),

    User.countDocuments({
      role: "sub-admin",
      isActive: true,
    }),

    User.countDocuments({
      role: "staff",
      isActive: true,
    }),

    User.countDocuments({
      role: "user",
      isActive: true,
    }),

    RewardCatalog.countDocuments({
      isActive: true,
    }),

    Challenge.countDocuments({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }),

    Redemption.countDocuments({
      status: "PENDING",
    }),
  ]);

  return {
    organizations,
    subAdmins,
    staff,
    employees,
    rewards,
    activeChallenges,
    pendingRedemptions,
  };
};