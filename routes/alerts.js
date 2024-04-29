// routes/alerts.js

const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert'); // Adjust the path according to your folder structure

// Endpoint to get all alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ date: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Endpoint to clear all alerts
router.delete('/', async (req, res) => {
  try {
    await Alert.deleteMany({});
    res.json({ message: 'All alerts cleared' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});




module.exports = router;
