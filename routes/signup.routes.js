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
    const { email, password, role, subUser, name, vendorName, address } = req.body;

    if (!email || !password || !name || !vendorName || !address ||!role) {
        return res.status(400).json({
            success: false,
            message: "All fields are mandatory."
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters long, and include one uppercase letter, one lowercase letter, one number, and one special character"
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
        name,
        vendorName,
        address,
        role,
        subUser,
        vendorId,
        verificationToken
    });

    try {
        await newUser.save();

        // Send verification email
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

       
     
        const mailOptions = {
            // from: 'arunrajshanker1@yahoo.com',
            from: `Medpick ${process.env.EMAIL_USER}`,
            to: email,
            subject: 'Email Verification',
            html: `<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            background: white;
            padding: 20px 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
            cursor:'pointer'
        }
        .container h1 {
            font-size: 24px;
            color: #333;
        }
        .container p {
            font-size: 16px;
            color: #666;
            margin: 20px 0;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s;
        }
        .btn:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Email Verification</h1>
        <p>Click the button below to verify your email address:</p>
        
        <a href="http://localhost:3000/signin/${verificationToken}" class="btn">Verify Email</a>
    </div>
</body>
</html>`,
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: "User created successfully. Verification email sent."
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