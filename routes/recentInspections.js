const express = require('express');
const router = express.Router();
const InspectionSchedule = require('../models/InspectionSchedule');


router.get('/', async (req, res) => {
    try {
      const recentInspections = await InspectionSchedule.find({ status: 'Completed' })
        .populate('establishment', 'tradeName') // Adjust the path and fields as necessary
        .sort({ date: -1 }); // Assuming you want to sort by the date the inspection was completed
      res.json(recentInspections);
    } catch (error) {
      console.error('Error fetching recent inspections:', error);
      res.status(500).send({ message: error.message });
    }
});

router.delete('/', async (req, res) => {
    try {
      await InspectionSchedule.deleteMany({ status: 'Completed' }); // Or update to clear the status
      res.json({ message: 'All recent inspections cleared' });
    } catch (error) {
      console.error('Error clearing recent inspections:', error);
      res.status(500).send({ message: error.message });
    }
});


  module.exports = router;
