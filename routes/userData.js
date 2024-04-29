const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/userDetails'); // Make sure this path is correct for your User model

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer Token
    if (token == null) return res.sendStatus(401); // No token provided

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403); // Invalid token

        // Attach the user's email to the request after verification
        req.email = decoded.email;
        next();
    });
};

// Get user data
router.get('/userData', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching user data for email:', req.email);
        const user = await User.findOne({ email: req.email }).select('-password');
        if (!user) {
            console.log('User not found for email:', req.email);
            return res.status(404).json({ status: 'error', error: 'User not found' });
        }
        console.log('User data found:', user);
        res.json({ status: 'ok', userData: user });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ status: 'error', error: 'An error occurred fetching user data' });
    }
});

module.exports = router;
