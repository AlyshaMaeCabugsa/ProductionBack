// routes/applications.js
const express = require('express');
const router = express.Router();
const { io } = require('../websocketServer');
const Application = require('../models/Application'); // Import the model
const applicationController = require('../controller/applicationController');
const { validateToken } = require('../utils/middleware'); // Adjust the path according to your structure

// Fetch a user's application data using their user ID from the JWT
router.get('/applications/user', validateToken, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id });
    if (applications.length === 0) {
      return res.status(404).send('No applications found for the user.');
    }
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/applications', validateToken, async (req, res) => {
  try {
    const newApplicationData = {
      ...req.body,
      userId: req.user.id // Extract userId from the token payload
    };

    const newApplication = new Application(newApplicationData);
    await newApplication.save();

    // Emit to all clients listening for new applications (such as an admin dashboard)
    io.emit('newApplication', newApplication); // Changed to `io.emit` to broadcast to all connected clients

    res.status(201).send(newApplication);
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: "Failed to create application due to input errors.", details: error.message });
  }
});

// Get all applications
router.get('/applications', applicationController.getApplications);

// Update application status
router.patch('/applications/:id/status', applicationController.updateStatus);

// Schedule an inspection
router.patch('/applications/:id/schedule', applicationController.scheduleInspection);


router.patch('/applications/:id', applicationController.updateApplication);




module.exports = router;


