
const { Router } = require("express");
const router = Router();
const { userModel } = require("../module/user.model");
const { v4: uuidv4 } = require('uuid');

router.patch("/", async (req, res) => {
  
    const { password, userId } = req.body;

    try {

        const user = await userModel.findByIdAndUpdate(userId, { password }, { new: true });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "Password updated successfully",
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update password",
            error: error.message
        });
    }
});


module.exports = router;