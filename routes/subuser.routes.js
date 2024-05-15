const { Router } = require("express");
const router = Router();
const { userModel } = require("../module/user.model");




router.post("/", async (req, res) => {
 
    const { subUser, email} = req.body;

    try {

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Main user not found"
            });
        }

 
        subUser.vendorId = user.vendorId
        user.subUser.push(subUser);

   
        await user.save();

        res.json({
            success: true,
            message: "Sub-user added successfully",
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add sub-user",
            error: error.message
        });
    }
});



module.exports = router;