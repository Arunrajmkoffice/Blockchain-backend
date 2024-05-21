const { Router } = require("express");
const router = Router();
const jwt = require('jsonwebtoken');
const { userModel } = require("../module/user.model");
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const { generateAccessToken } = require("../middleware/authenticateToken");


router.post("/", async (req, res) => {
    const { email, password } = req.body;

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

  
  const passwordRegex = /^.{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long."
    });
  }

    try {
        let user = await userModel.findOne({ email });
       
        if (!user) {
            const subUser = await userModel.findOne({ "subUser.email": email });
            if (!subUser) {
                return res.status(401).json({ message: 'Login failed: User not found' });
            }
            const subUserData = subUser.subUser.find(sub => sub.email === email && sub.password === password);
            if (!subUserData) {
                return res.status(401).json({ message: 'Login failed: Incorrect password' });
            }
            user = subUserData; 
        } else {
            if (password !== user.password) {
                return res.status(401).json({ message: 'Login failed: Incorrect password' });
            }
        }



       if (user.verificationToken) {
    
            const transporter = nodemailer.createTransport({
                service: process.env.EMAIL_SERVICE,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            
            const mailOptions = {
                from: `Medpick ${process.env.EMAIL_USER}`,
                to: email,
                subject: 'Email Verification',
                html: `<p>Click <a href="http://localhost:3000/signin/${user.verificationToken}">here</a> to verify your email address.</p>`,
            };

            await transporter.sendMail(mailOptions);

            res.json({
                success: true,
                message: "Please verify the email, verification email has been send.",
            });
        }




        // if (user.verificationToken==="Success") {

            const secretKey = process.env.SECRET_KEY;
            // const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '10h' });
            const token = generateAccessToken(user)
            const refreshToken = jwt.sign({ userId: user._id }, '123');
            res.json({ message: 'Login Success', token, email: user.email, name:user.name, vendorName:user.vendorName, address:user.address,  role: user.role, userId: user._id, vendorId: user.vendorId,refreshToken:refreshToken });


        // } 
        // if (user.verificationToken===undefined) {

        //     const secretKey = process.env.SECRET_KEY;
        //     const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '10h' });
        //     res.json({ message: 'Login Success', token, email: user.email, role: user.role, userId: user._id, vendorId: user.vendorId });


        // } 




       

    } catch (error) {
        console.error("Error:", error); 
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});




module.exports = router;