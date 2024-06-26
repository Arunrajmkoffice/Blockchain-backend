require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const {connection} = require('./config/db');
const signinRoutes = require('./routes/signin.routes');
const signupRoutes = require('./routes/signup.routes');
const userScan = require('./routes/userScan.routes')
const password = require('./routes/password.routes');
const subuser = require('./routes/subuser.routes');
const vendor = require('./routes/vendor.routes');
const deleteUser = require('./routes/deleteUser.routes');
const refreshToken = require('./middleware/refreshToken')
const logout = require('./middleware/logout')
const pathPost = require('./routes/pathPost.routes');
const aiSearch = require('./routes/aiSearch.routes');
const changePassword = require('./routes/changePassword.routes');
const verifyEmail = require('./routes/verifyEmail.routes');
const imageRoute = require('./routes/image.routes');
const bodyParser = require('body-parser');
const productDetails = require('./routes/productDetails.routes');
const convertAndSave = require('./routes/convert-and-save.routes');

app.use(bodyParser.json({ limit: '50mb' }));

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
require("dotenv").config()
const PORT = process.env.PORT||9096


app.use(cors());
app.use(express.json());
app.use("/signup", signupRoutes);
app.use("/signin", signinRoutes);
app.use("/product", productDetails);
app.use("/convert", convertAndSave);
app.use("/password", password);
app.use("/subuser", subuser);
app.use("/change-password", changePassword);
app.use("/user-scan", userScan);
app.use("/vendor", vendor);
app.use("/image", imageRoute);
app.use("/verify", verifyEmail);
app.use("/user", deleteUser);
app.use("/ai", aiSearch );
app.use("/path", pathPost);
app.use("/refresh", refreshToken);
app.use("/logout", logout);
app.use(cors());


app.listen(PORT,async()=>{
    console.log("Listining to port 9096")
try {
    await connection;
    console.log("Connected to db successfully");
} catch(error) {
    console.log("Error connecting to db", error);
}

})
