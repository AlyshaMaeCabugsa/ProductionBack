const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/userDetails');
const UserProfile = require('../models/userProfile');

// Destructure the needed controller functions directly
const { createProfile, getAllProfiles, updateProfileComplete } = require('../controller/userController');

router.post("/register", async (req, res) => {
    try {
        const { fname, lname, email, password, userType } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            fname,
            lname,
            email,
            password: hashedPassword,
            userType,
        });
        await newUser.save();
        res.status(201).json({ status: "ok", message: "User registered successfully" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ status: "error", error: "Internal server error" });
    }
});

// Use the destructured functions directly
router.post('/profile', createProfile);
router.get('/profiles', getAllProfiles); //this is for the admin
router.post('/updateProfileComplete', updateProfileComplete);

router.get('/profile/:userId', async (req, res) => {
    try {
        // Make sure to use the full 24-character ObjectId
        const userProfile = await UserProfile.findOne({ user: req.params.userId }).exec();
        if (!userProfile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.status(200).json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

router.patch('/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    const updateData = req.body;

    try {
        const updatedProfile = await UserProfile.findOneAndUpdate(
            { user: userId },
            updateData,
            { new: true, runValidators: true, context: 'query' }
        );
        if (!updatedProfile) {
            return res.status(404).json({ message: 'UserProfile not found' });
        }
        res.status(200).json(updatedProfile);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = router;
