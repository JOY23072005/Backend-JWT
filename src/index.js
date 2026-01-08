import express from "express";
import cors from "cors";

import AuthRoutes from "./routes/auth.route.js";
import UserRoutes from "./routes/user.route.js";
import OrgRoutes from "./routes/org.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.use("/auth", AuthRoutes);
app.use("/user", UserRoutes);
app.use("/org", OrgRoutes);

export default app; // ✅ IMPORTANT
