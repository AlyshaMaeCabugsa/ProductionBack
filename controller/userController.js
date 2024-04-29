// Assuming User refers to UserDetails and UserProfile to additional profile details
const mongoose = require('mongoose');
const User = require('../models/userDetails');
const UserProfile = require('../models/userProfile');

exports.createProfile = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Retrieve userId from the request body and convert it to a mongoose ObjectId
        const userId = new mongoose.Types.ObjectId(req.body.user);
        console.log("Creating profile for userId:", userId); // Log the userId being processed

        // Check if the profile already exists for the user
        const existingProfile = await UserProfile.findOne({ user: userId }).session(session);
        console.log("Found profile: ", existingProfile); // Log for debugging
        if (existingProfile) {
            throw new Error('Profile already exists');
        }

        // Extract profile data excluding the userId from the body
        const { user, ...profileData } = req.body;

        // Create a new UserProfile with the provided data and userId
        const userProfile = new UserProfile({ user: userId, ...profileData });

        // Save the new UserProfile document to the database
        await userProfile.save({ session });

        // Update the User document's profileComplete field to true
        const userUpdateResult = await User.findByIdAndUpdate(
            userId,
            { profileComplete: true },
            { new: true, session }
        );

        // Check if the User document was successfully updated
        if (!userUpdateResult) {
            throw new Error('User not found');
        }

        // Commit the transaction to permanently save the changes
        await session.commitTransaction();
        res.status(201).json({ message: "Profile created successfully", data: userProfile });
    } catch (error) {
        // Abort the transaction in case of an error
        await session.abortTransaction();
        res.status(400).json({ error: error.message });
    } finally {
        // End the session regardless of the outcome
        session.endSession();
    }
};

exports.updateProfileComplete = async (req, res) => {
    try {
      const { userId } = req.body; // Make sure the userId is being sent in the request body
      const updatedUser = await User.findByIdAndUpdate(userId, { profileComplete: true }, { new: true });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ message: "User profile status updated", user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };


exports.getAllProfiles = async (req, res) => {
    try {
      // Retrieve all users and their profile status
      const users = await User.find({}).populate('profile'); // Ensure you have a reference to UserProfile in User model
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
