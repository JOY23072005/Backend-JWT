import express from "express"
import AuthRoutes from "./routes/auth.route.js";
import UserRoutes from "./routes/user.route.js";

const app = express();
app.get("/",(res,req)=>{
    res.send("This is Test endpoint")
})
app.use("/auth",AuthRoutes);
app.use("/user",UserRoutes);

app.listen(5001,()=>{
    console.log("server is running on port 5001")
})