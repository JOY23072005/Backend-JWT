import bcrypt from "bcryptjs"
import User from "../models/user.model.js";
import { generateAccessToken, generateOTP } from "../lib/utils.js";
import OTP from "../models/otp.model.js";
import jwt from "jsonwebtoken";

export const signup = async (req,res) =>{
    const {name,email,phone,dob,gender,orgid,empid,roll,password} = req.body;
    try {
        if(!name || !email || !dob || !gender){
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

        if (!emailOtp) {
            return res.status(400).json({
                message: "OTP not verified for email",
            });
        }

        const user = await User.exists({email,organizationId: orgid})

        if(user) return res.status(400).json({message:"Email already exists"});

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser= new User({
            name:name,
            email:email,
            phone:phone,
            dob:dob,
            gender:gender,
            organizationId:orgid || "6933174a8678d7036f8754b6",
            employeeId:empid,
            roll:roll,
            password:hashedPassword,
        })

        if(newUser) {
            await newUser.save();

            // Delete used OTPs
            await OTP.deleteMany({ identifier: email });
            await OTP.deleteMany({ identifier: phone });

            const AccessToken = generateAccessToken(newUser._id,newUser.organizationId);

            return res.status(201).json({
                success: true,
                message: "Signup successful.",
                userId: newUser._id,
                token: AccessToken,
            });
        }
    } catch (error) {
        console.error("signup error:",error.message);
        return res.status(500).json({ message: "Server error" });
    }

}

export const login = async (req,res) =>{
    const {orgid,email,phone,password} = req.body;

    if (!password || (!email && !phone) || !orgid) {
        return res.status(400).json({ message: "Email/Phone and password & orgid are required." });
    }

    try {
        const user = await User.findOne({
            $or: [
                {email:email},
                {phone:phone}
            ],
            organizationId: orgid
        }).select('+password +organizationId');

        if(!user) {
            return res.status(400).json({message:"Invalid credentials"});
        }
        
        const isCorrect = await bcrypt.compare(password,user.password);
        if(!isCorrect){
            return res.status(400).json({message:"Invalid credentials"});
        }

        user.password = undefined;
        const AccessToken = generateAccessToken(user._id,user.organizationId);
        
        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token:AccessToken,
        })
    } catch(error){
        console.error("login error:",error.message);
        return res.status(500).json({message: "Server error" });
    }
}

export const changePass = async (req, res) => {
    const { oldpass, newpass } = req.body;

    if (!oldpass || !newpass) {
        return res.status(400).json({
            message: "Old password and new password are required."
        });
    }

    if (newpass.length < 6) {
        return res.status(400).json({
            message: "New password must be at least 6 characters."
        });
    }

    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("+password");

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isCorrect = await bcrypt.compare(oldpass, user.password);
        if (!isCorrect) {
            return res.status(400).json({ message: "Incorrect old password" });
        }

        const hashedPassword = await bcrypt.hash(newpass, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("changePass error:", error.message);
        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const requestOTP = async (req, res) => {
    const { orgid, phone, email,islogin } = req.body;

    const identifier = phone || email;
    if (!identifier) {
        return res.status(400).json({ message: "Phone or Email is required" });
    }

    const user = await User.exists({
        $or: [
            {email:email},
            {phone:phone}
        ],
        organizationId: orgid
    });

    if(islogin && !user){
        return res.status(400).json({message:"User does not exist in given organisation"})
    }

    if(!islogin && user){
        return res.status(400).json({message:"User already exists. Please login"})
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
        otp,
        userExist:user?true:false
    });
};

export const verifyOTP = async (req, res) => {
    const { orgid, phone, email, otp, islogin } = req.body;

    const identifier = phone || email;

    try {
        // Find OTP record
        const otpRecord = await OTP.findOne({ identifier });

        if (!otpRecord)
            return res.status(400).json({ message: "OTP not found or expired" });

        if (otpRecord.otp !== otp)
            return res.status(400).json({ message: "Invalid OTP" });

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        // If it's NOT a login request -> just return success
        if (!islogin) {
            return res.status(200).json({
                success: true,
                message: "OTP verified successfully"
            });
        }

        // Login Flow ------------------------------------------
        const user = await User.findOne({
            $or: [{ email: email }, { phone: phone }],
            organizationId: orgid,
        }).select("+password +organizationId");

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Remove password for response safety
        user.password = undefined;

        // Generate Access Token
        const accessToken = generateAccessToken(user._id, user.organizationId);

        return res.status(200).json({
            success: true,
            message: "OTP verified. Login successful",
            token: accessToken,
            userExist: user?true:false,
        });

    } catch (error) {
        console.log("Error in verifyOTP:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
};

// forget and reset
export const forgotPass = async (req, res) => {
    try {
        const { orgid, email, phone } = req.body;
        const identifier = phone || email;

        if (!identifier || !orgid) {
            return res.status(400).json({
                message: "Email/Phone and orgid are required",
            });
        }

        const user = await User.findOne({
            $or: [{ email }, { phone }],
            organizationId: orgid,
        });

        // Do NOT reveal user existence
        if (!user) {
            return res.status(200).json({
                message: "If the account exists, an OTP has been sent",
            });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        // Remove old OTPs
        await OTP.deleteMany({ identifier });

        // Save new OTP
        await OTP.create({
            identifier,
            otp,
            expiresAt,
            verified: false,
        });

        // TODO: send OTP via email/SMS here

        return res.status(200).json({
            success: true,
            message: "OTP sent for password reset",
            otp, // ⚠️ remove in production
        });

    } catch (error) {
        console.error("forgotPass error:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
};

export const resetPass = async (req, res) => {
    const { email, phone, otp, orgid, newpass } = req.body;
    const identifier = phone || email;

    if (!identifier || !otp || !orgid || !newpass) {
        return res.status(400).json({
            message: "Invalid request",
        });
    }

    try {
        const otpRecord = await OTP.findOne({ identifier });

        if (!otpRecord)
            return res.status(400).json({ message: "OTP not found or expired" });

        if (otpRecord.otp !== otp)
            return res.status(400).json({ message: "Invalid OTP" });

        if (otpRecord.expiresAt < new Date())
            return res.status(400).json({ message: "OTP expired" });

        otpRecord.verified = true;
        await otpRecord.save();

        return res.status(200).json({
            success: true,
            message: "OTP verified. You can reset password now",
        });

    } catch (error) {
        console.error("verifyForgotOTP error:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
};
