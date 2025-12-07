import Organization from "../models/organisation.model.js"

export const getAllOrg = async (req, res) => {
    try {
        const organizations = await Organization.find({ isActive: true });
        let formatOrgs=[]
        organizations.map(o=>{
            formatOrgs.push({
                orgid:o._id,
                name:o.name,
                image:o.imageurl,
                category:o.category
            })
        })

        return res.status(200).json({
            success: true,
            formatOrgs,
        });
    } catch (error) {
        console.log("Error in getAllOrg:", error.message);
        return res.status(500).json({ message: "Server Error" });
    }
};
