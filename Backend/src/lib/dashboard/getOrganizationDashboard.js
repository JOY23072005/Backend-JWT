import User from "../../models/user.model.js";
import RewardCatalog from "../../models/rewardCatalog.model.js";
import Challenge from "../../models/challenge.model.js";
import Redemption from "../../models/redemption.model.js";

export const getOrganizationDashboard = async (
  organizationId
) => {
  const now = new Date();

  const [
    employees,
    staff,
    rewards,
    activeChallenges,
    pendingRedemptions,
  ] = await Promise.all([
    User.countDocuments({
      organizationId,
      role: "user",
      isActive: true,
    }),

    User.countDocuments({
      organizationId,
      role: "staff",
      isActive: true,
    }),

    RewardCatalog.countDocuments({
      organizationId,
      isActive: true,
    }),

    Challenge.countDocuments({
      organizationId,
      isActive: true,
      startDate: {
        $lte: now,
      },
      endDate: {
        $gte: now,
      },
    }),

    Redemption.countDocuments({
      organizationId,
      status: "PENDING",
    }),
  ]);

  return {
    employees,
    staff,
    rewards,
    activeChallenges,
    pendingRedemptions,
  };
};