const express = require('express');
const { authenticateToken, tokenBlacklist } = require('./authenticateToken');
const router = express.Router();

// Logout route
router.post('/', authenticateToken, (req, res) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    // Add the token to the blacklist
    tokenBlacklist.add(token);


    res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;