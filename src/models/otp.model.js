import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        identifier: { type: String, required: true }, // email or phone
        otp: { type: String, required: true },
        verified: { type: Boolean, default: false},
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

// delete expired OTPs automatically
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
