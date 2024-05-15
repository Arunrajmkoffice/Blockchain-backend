const { Router } = require("express");
const { userModel } = require("../module/user.model");
const router = Router();

router.post("/", async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Verification token is missing"
        });
    }

    try {
        const user = await userModel.findOne({ verificationToken: token });
        if (user==="Success") {
            return res.status(400).json({
                success: false,
                message: "Link expired."
            });
        }

        user.verificationToken = 'Success'; // Clear the token after verification
        await user.save();

        res.json({
            success: true,
            message: "Email verified successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to verify email",
            error: error.message
        });
    }
});

module.exports = router;