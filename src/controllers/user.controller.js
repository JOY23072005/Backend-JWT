import User from "../models/user.model.js";

export const updateProfile = async (req,res) => {
    const {name,email,phone,dob,gender,orgid,empid,roll} = req.body;
    try{
    let isEmailVerified = false;
    if(email){
        const emailOtp = await OTP.findOne({ identifier: email, verified: true });
        if (!emailOtp) {
            return res.status(400).json({
                message: "OTP not verified for email or phone",
            });
        }
        await OTP.deleteMany({ identifier: email });
        isEmailVerified=true;
    }

    let isPhoneVerified = false;
    if (phone) {
        const phoneOtp = await OTP.findOne({ identifier: phone, verified: true });
        if (!phoneOtp) {
            return res.status(400).json({
                message: "OTP not verified for new phone.",
            });
        }
        await OTP.deleteMany({ identifier: phone });
        isPhoneVerified = true;
    }

    const userId = req.userId;
    const updatedUser = await User.findById(userId).select("-password");
    
    if(name) updatedUser.name = name;
    if(email && isEmailVerified) updatedUser.email = email;
    if(phone && isPhoneVerified) updatedUser.phone = phone;
    if(roll) updatedUser.roll = roll;
    if(empid) updatedUser.empid = empid;
    if(orgid) updatedUser.orgid = orgid;
    if(dob) updatedUser.dob = dob;
    if(gender) updatedUser.gender = gender;

    await updatedUser.save();
    
    return res.status(200).json({
        success:true,
        message:"Updated successfully",
    })
    } catch(error){
        console.log("error in updateProfile",error.message)
        return res.status(500).json({message:"Internal server error"});
    }
}
export const getDetails = async (req,res)=>{
    const userId = req.userId;
    try{
    const user = await User.findById(userId).select("-password -_id -__v");
    if(!user){
        return res.status(400).json({message:"User not found"});
    }
    return res.status(200).json(user)
    } catch(error) {
        console.log("error in getDetails ",error.message);
        return res.status(500).json({
            message:"Server error"
        })
    }
}