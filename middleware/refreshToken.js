const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { generateAccessToken } = require('./authenticateToken');



router.post('/', (req, res) => {
    const refreshToken = req.body.refreshToken;

    // Verify the refresh token
    jwt.verify(refreshToken, '123', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
        
        // Refresh token is valid, generate new access token
        const accessToken = generateAccessToken(user);
        res.json({ accessToken });
    });
});

module.exports = router;