const { Router } = require("express");
const router = Router();
const { userModel } = require("../module/user.model");
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

router.patch("/", async (req, res) => {
    const { email } = req.body;
    try {
     
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

    
        const resetToken = uuidv4();

       
        const tokenExpiration = new Date();
        tokenExpiration.setHours(tokenExpiration.getHours() + 1);

     
        await userModel.findByIdAndUpdate(user._id, {
            resetToken,
            resetTokenExpiration: tokenExpiration
        });

    
        const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
        await sendResetEmail(email, resetLink);

        res.json({
            success: true,
            message: "Password reset email sent successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to send password reset email",
            error: error.message
        });
    }
});

async function sendResetEmail(email, resetLink) {
   
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Email message
    const mailOptions = {
        from: `Medpick ${process.env.EMAIL_USER}`,
        to: email,
        subject: 'Password Reset',
        text: `Click the following link to reset your password: ${resetLink}`
    };

    // Send email
    await transporter.sendMail(mailOptions);
}

module.exports = router;