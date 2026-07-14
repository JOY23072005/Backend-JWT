// models/refreshToken.model.js
import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
    index: true,
  },

  tokenHash: {
    type: String,
    required: true,
    index: true
  },

  expiresAt: {
    type: Date,
    required: true,
    index: true
  }
}, { timestamps: true });

export default mongoose.model("RefreshToken", refreshTokenSchema);