import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        imageurl : {
            type:String,
        },

        category : {
            type:String,
            required:true,
        }
    },
    { timestamps: true }
);

const Organization = mongoose.model("Organization", organizationSchema);

export default Organization;