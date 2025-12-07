import express from "express"
import { getAllOrg } from "../controllers/org.controller.js";

const OrgRoutes = express.Router();

OrgRoutes.get("/",getAllOrg);

export default OrgRoutes;