const jwt = require('jsonwebtoken');


const generateAccessToken = (user) => {
    return jwt.sign({ userId: user._id }, '123', { expiresIn: '45m' });
};

const tokenBlacklist = new Set();


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) {
        return res.sendStatus(401);
    }
    if (tokenBlacklist.has(token)) {
        return res.status(401).json({ message: 'Token has been invalidated' });
    }

    jwt.verify(token, '123', (err, user) => {
        // if (err) {
        //     // return res.sendStatus(403);
        //     return res.status(403).json({ message: 'Invalid token' });
        // }



        if (err) {
            if (err.name === 'TokenExpiredError') {
                // Optionally, add the expired token to the blacklist
                tokenBlacklist.add(token);
                return res.status(401).json({ message: 'Token expired, please log in again' });
            } else {
                return res.status(403).json({ message: 'Invalid token' });
            }

        }



        req.user = user;
        next();
    });
};

module.exports = { authenticateToken, generateAccessToken, tokenBlacklist };



// const authenticateToken = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
    
//     if (token == null) {
//         return res.sendStatus(401);
//     }

//     let secretKey = process.env.SECRET_KEY

//     jwt.verify(token, secretKey, (err, user) => {
//         if (err) {
//             return res.sendStatus(403);
//         }
//         req.user = user;
//         next();
//     });
// };

// module.exports = authenticateToken;