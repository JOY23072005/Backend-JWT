import { connectDB } from "../lib/db.js";

import { getAdminDashboard } from "../lib/dashboard/getAdminDashboard.js";
import { getOrganizationDashboard } from "../lib/dashboard/getOrganizationDashboard.js";

export const getDashboard = async (req, res) => {
  try {
    await connectDB();

    let summary;

    switch (req.user.role) {
      case "admin":
        summary = await getAdminDashboard();
        break;

      case "sub-admin":
        summary = await getOrganizationDashboard(
          req.user.organizationId
        );
        break;

      default:
        return res.status(403).json({
          message: "Forbidden",
        });
    }

    return res.status(200).json({
      success: true,
      role: req.user.role,
      summary,
    });

  } catch (error) {

    console.log(
      "getDashboard",
      error.message
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};