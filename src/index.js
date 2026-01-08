import express from "express"
import dotenv from "dotenv"
import cors from "cors"

import AuthRoutes from "./routes/auth.route.js";
import UserRoutes from "./routes/user.route.js";
import { connectDB } from "./lib/db.js";
import OrgRoutes from "./routes/org.route.js";

dotenv.config()
const app = express();

app.use(cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

app.get("/",(req,res)=>{
    res.status(200).json({message:"This is Test endpoint"})
})
app.use("/auth",AuthRoutes);
app.use("/user",UserRoutes);
app.use("/org",OrgRoutes);

const PORT = process.env.PORT

app.listen(PORT,async ()=>{
    console.log(`server is running on port ${PORT}`)
    await connectDB();
})