const { Router } = require("express");
const router = Router();
const { userModel } = require("../module/user.model");


// router.patch("/:id", async (req, res) => {
//     const  resetToken  = req.params.id;
//     const { newPassword } = req.body;

//     try {
      
//         const user = await userModel.findOne({ resetToken });

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Invalid or expired reset token"
//             });
//         }

   
//         if (user.resetTokenExpiration < new Date()) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Reset token has expired"
//             });
//         }

     

      
//         user.password = newPassword;
//         user.resetToken = undefined;
//         user.resetTokenExpiration = undefined;
//         await user.save();

//         res.json({
//             success: true,
//             message: "Password updated successfully"
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Failed to update password",
//             error: error.message
//         });
//     }
// });




router.patch("/:id", async (req, res) => {
    const resetToken = req.params.id;
    const { newPassword } = req.body;

    try {
     
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            });
        }


        const user = await userModel.findOne({ resetToken });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

     
        if (user.resetTokenExpiration < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Reset token has expired"
            });
        }


        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        res.json({
            success: true,
            message: "Password updated successfully"
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