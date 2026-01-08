import bcrypt from "bcryptjs"
import User from "../models/user.model.js";
import { generateAccessToken, generateOTP, sendOtpEmail } from "../lib/utils.js";
import OTP from "../models/otp.model.js";
import { connectDB } from "../lib/db.js"


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

        await connectDB();

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

        await connectDB();

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

        await connectDB();

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

export const requestOtp = async (req, res) => {
    const { orgid, email, phone, purpose } = req.body;
    const identifier = phone || email;

    if (!identifier || !purpose) {
        return res.status(400).json({ message: "Identifier and purpose are required" });
    }

    if (!["LOGIN", "SIGNUP", "RESET_PASSWORD"].includes(purpose)) {
        return res.status(400).json({ message: "Invalid OTP purpose" });
    }

    await connectDB();

    const user = await User.exists({
        $or: [{ email }, { phone }],
        organizationId: orgid,
    });

    // Purpose-based validation
    if ((purpose === "LOGIN" || purpose === "RESET_PASSWORD") && !user) {
        return res.status(400).json({ message: "User does not exist" });
    }

    if (purpose === "SIGNUP" && user) {
        return res.status(400).json({ message: "User already exists. Please login" });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Remove old OTPs for same identifier + purpose
    await OTP.deleteMany({ identifier, purpose });

    await OTP.create({
        identifier,
        otp,
        purpose,
        expiresAt,
        verified: false,
    });
    // console.log(email,otp);

    await sendOtpEmail({ to: email, otp: otp });

    return res.json({
        success: true,
        message: "OTP sent successfully",
    });
};

export const verifyOtp = async (req, res) => {
    const { orgid, email, phone, otp, purpose } = req.body;
    const identifier = phone || email;

    if (!identifier || !otp || !purpose) {
        return res.status(400).json({ message: "Invalid request" });
    }

    if (!["LOGIN", "SIGNUP", "RESET_PASSWORD"].includes(purpose)) {
        return res.status(400).json({ message: "Invalid OTP purpose" });
    }

    await connectDB();

    const otpRecord = await OTP.findOne({
        identifier,
        purpose,
        expiresAt: { $gt: new Date() },
    });

    if (!otpRecord || otpRecord.otp !== otp) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    // 🔹 SIGNUP / RESET → just verification
    if (purpose === "SIGNUP" || purpose === "RESET_PASSWORD") {
        return res.json({
            success: true,
            message: "OTP verified successfully",
        });
    }

    // 🔹 LOGIN → issue token
    const user = await User.findOne({
        $or: [{ email }, { phone }],
        organizationId: orgid,
    });

    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateAccessToken(user._id, user.organizationId);

    return res.json({
        success: true,
        message: "Login successful",
        token,
    });
};
export const resetPass = async (req, res) => {
    const { email, phone, orgid, newpass } = req.body;
    const identifier = phone || email;

    if (!identifier || !newpass || !orgid) {
        return res.status(400).json({ message: "Invalid request" });
    }

    if (newpass.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    await connectDB();

    const otpRecord = await OTP.findOne({
        identifier,
        purpose: "RESET_PASSWORD",
        verified: true,
    });

    if (!otpRecord) {
        return res.status(400).json({ message: "OTP verification required" });
    }

    const user = await User.findOne({
        $or: [{ email }, { phone }],
        organizationId: orgid,
    });

    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(newpass, 10);
    user.passwordChangedAt = new Date();
    await user.save();

    // Invalidate OTP after use
    await OTP.deleteMany({ identifier, purpose: "RESET_PASSWORD" });

    return res.json({
        success: true,
        message: "Password reset successful",
    });
};
