import express from "express"

const UserRoutes= express.Router();

UserRoutes.post("/update-profile",(req,res)=>{
    res.send("Profile Updated");
})

UserRoutes.post("/details",(req,res)=>{
    res.send("User Details");
})

export default UserRoutes;