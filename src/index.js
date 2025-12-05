import express from "express"
import dotenv from "dotenv"
import AuthRoutes from "./routes/auth.route.js";
import UserRoutes from "./routes/user.route.js";
import { connectDB } from "./lib/db.js";

dotenv.config()
const app = express();

app.use(express.json());

app.get("/",(res,req)=>{
    res.status(200).json({"message":"This is Test endpoint"})
})
app.use("/auth",AuthRoutes);
app.use("/user",UserRoutes);


const PORT = process.env.PORT

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
    connectDB();
})