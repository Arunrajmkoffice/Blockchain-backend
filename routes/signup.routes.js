const { Router } = require("express");
const router = Router();
const { userModel } = require("../module/user.model");
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');





// router.post("/", async (req, res) => {
//     const { email, password, role, subUser } = req.body;

   
//     if (!email || !password) {
//         return res.status(400).json({
//             success: false,
//             message: "Email and password are mandatory"
//         });
//     }

  
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


//     if (!emailRegex.test(email)) {
//         return res.status(400).json({
//             success: false,
//             message: "Invalid email format"
//         });
//     }


//     const existingUser = await userModel.findOne({ email });
//     if (existingUser) {
//         return res.status(400).json({
//             success: false,
//             message: "Email already exists"
//         });
//     }


//     const existingSubUser = await userModel.findOne({ "subUser.email": email });
//     if (existingSubUser) {
//         return res.status(400).json({
//             success: false,
//             message: "Email already exists for a subuser",
//             subUsers: existingSubUser.subUser
//         });
//     }

//    let vendorId = uuidv4() 

 
//     if(subUser?.length>0){
//         subUser.forEach(user => {
//             user.vendorId = vendorId;
//           });
//     }
  




//     const newUser = new userModel({
//         email: email,
//         password: password,
//         role: role,
//         subUser: subUser,
//         vendorId: vendorId
//     });

//     try {
//         await newUser.save();
//         res.json({
//             success: true,
//             message: "User created successfully",
//             newUser
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Failed to create user",
//             error: error.message
//         });
//     }
// });






router.post("/", async (req, res) => {
    const { email, password, role, subUser } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are mandatory"
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "Email already exists"
        });
    }

    const existingSubUser = await userModel.findOne({ "subUser.email": email });
    if (existingSubUser) {
        return res.status(400).json({
            success: false,
            message: "Email already exists for a subuser",
            subUsers: existingSubUser.subUser
        });
    }

    let vendorId = uuidv4();

    if (subUser?.length > 0) {
        subUser.forEach(user => {
            user.vendorId = vendorId;
        });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4(); // Generate verification token

    const newUser = new userModel({
        email,
        password: password,
        role,
        subUser,
        vendorId,
        verificationToken
    });

    try {
        await newUser.save();

        // Send verification email
        const transporter = nodemailer.createTransport({
            service: 'yahoo',
            auth: {
                user: 'arunrajshanker1@yahoo.com',
                pass: 'iarpmrghxjlynimi',
            },
        });
     
        const mailOptions = {
            from: 'arunrajshanker1@yahoo.com',
            to: email,
            subject: 'Email Verification',
            html: `<p>Click <a href="http://localhost:3000/verify/${verificationToken}">here</a> to verify your email address.</p>`,
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: "User created successfully. Verification email sent.",
            newUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create user",
            error: error.message
        });
    }
});





router.patch("/password", async (req, res) => {

    const { password,email } = req.body;

    try {
   
        const user = await userModel.findOneAndUpdate({ email }, { password }, { new: true });

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


router.post("/subUser", async (req, res) => {
 
    const { subUser,email } = req.body;

    try {

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Main user not found"
            });
        }

  
        let pushData = subUser.vendorId = user.vendorId
      
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