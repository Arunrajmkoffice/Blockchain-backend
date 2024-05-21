const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { generateAccessToken } = require('./authenticateToken');



router.post('/', (req, res) => {
    const refreshToken = req.body.refreshToken;


    jwt.verify(refreshToken, '123', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
        
     
        const accessToken = generateAccessToken(user);
        res.json({ accessToken });
    });
});

module.exports = router;