import bcrypt from "bcryptjs"
import User from "../models/user.model.js";
import { generateAccessToken, generateOTP, verifyAccessToken } from "../lib/utils.js";
import OTP from "../models/otp.model.js";

export const signup = async (req,res) =>{
    const {name,email,phone,dob,gender,orgid,empid,roll,password} = req.body;
    try {
        if(!name || !email || !phone || !dob || !gender || !orgid){
            return res.status(400).json({
                success:false,
                message: "Please fill the mandatory fields",
                userId:null
            })
        }
        if(!password || password.length<6){
            return res.status(400).json({
                message: "Password must be at least 6 characters",
            });
        }

        // CHECK OTP FOR EMAIL OR PHONE (IMPORTANT FIX)
        const emailOtp = await OTP.findOne({ identifier: email, verified: true });
        const phoneOtp = await OTP.findOne({ identifier: phone, verified: true });

        if (!emailOtp && !phoneOtp) {
            return res.status(400).json({
                message: "OTP not verified for email or phone",
            });
        }

        const user = await User.findOne({email,organizationId: orgid})

        if(user) return res.status(400).json({message:"Email already exists"});

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser= new User({
            name:name,
            email:email,
            phone:phone,
            dob:dob,
            gender:gender,
            organizationId:orgid,
            employeeId:empid,
            roll:roll,
            password:hashedPassword,
        })

        if(newUser) {
            await newUser.save();

            // Delete used OTPs
            await OTP.deleteMany({ identifier: email });
            await OTP.deleteMany({ identifier: phone });

            return res.status(201).json({
                success: true,
                message: "Signup successful. Please login",
                userId: newUser._id
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }

}

export const login = async (req,res) =>{
    const {email,phone,password} = req.body;

    if (!password || (!email && !phone)) {
        return res.status(400).json({ message: "Email/Phone and password are required." });
    }

    try {
        const user = await User.findOne({
            $or: [
                {email:email},
                {phone:phone}
            ]
        }).select('+password');

        if(!user) {
            return res.status(400).json({message:"Invalid credentials"});
        }
        
        const isCorrect = await bcrypt.compare(password,user.password);
        if(!isCorrect){
            return res.status(400).json({message:"Invalid credentials"});
        }

        user.password = undefined;
        const AccessToken = generateAccessToken(user._id);
        
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token:AccessToken,
        })
    } catch(error){
        console.error(error);
        return res.status(500).json({message: "Server error" });
    }
}

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjQ5NjEzMDUsImV4cCI6MTc2NzU1MzMwNX0.0v1uVAAIpqRvCCIpWZ-dkMHWN3CHIuztReNwikn5LTs

export const changePass = async (req,res) =>{
    const {email,phone,oldpass,newpass,token} = req.body;
    
    if (!oldpass || !newpass || !token || (!email && !phone)) {
        return res.status(400).json({ message: "Email/Phone, passwords & token are required." });
    }

    try {
        const data = verifyAccessToken(token);
        console.log(data);
        const user = await User.findOne({
            $or: [
                {email:email},
                {phone:phone}
            ]
        }).select('+password');

        if(!user) {
            return res.status(400).json({message:"Invalid credentials"});
        }
        
        const isCorrect = await bcrypt.compare(oldpass,user.password);
        if(!isCorrect){
            return res.status(400).json({message:"Invalid credentials"});
        }
        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newpass,salt)
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successful",
        })
    } catch(error){
        console.error(error);
        return res.status(500).json({message: "Server error" });
    }
}

export const requestOTP = async (req, res) => {
    const { phone, email } = req.body;

    const identifier = phone || email;
    if (!identifier) {
        return res.status(400).json({ message: "Phone or Email is required" });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 5 minutes

    // Delete old OTP for same user
    await OTP.deleteMany({ identifier });

    // Save new OTP
    await OTP.create({
        identifier,
        otp,
        expiresAt
    });

    // TEMP: return OTP for now
    res.json({
        success: true,
        message: "OTP sent",
        otp
    });
};

export const verifyOTP = async (req, res) => {
    const { phone, email, otp } = req.body;

    const identifier = phone || email;

    const otpRecord = await OTP.findOne({ identifier });

    if (!otpRecord)
        return res.status(400).json({ message: "OTP not found or expired" });

    if (otpRecord.otp !== otp)
        return res.status(400).json({ message: "Invalid OTP" });

    // mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    return res.json({ success: true, message: "OTP verified" });
};

export const verifyLoginOTP = async (req,res) => {
    const { phone, email, otp } = req.body;

    const identifier = phone || email;

    const otpRecord = await OTP.findOne({ identifier });

    if (!otpRecord)
        return res.status(400).json({ message: "OTP not found or expired" });

    if (otpRecord.otp !== otp)
        return res.status(400).json({ message: "Invalid OTP" });

    // mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    const user = User.findOne({
            $or: [
                {email:email},
                {phone:phone}
            ]
        });
    const AccessToken = generateAccessToken(user._id);

    return res.status(200).json({ success: true, message: "OTP verified. Login successful",token: AccessToken });
}