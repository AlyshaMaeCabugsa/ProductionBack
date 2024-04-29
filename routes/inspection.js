const express = require('express');
const router = express.Router();
const inspectionController = require('../controller/inspectionController');

// Route to create a new inspection schedule
router.post('/', inspectionController.create_inspection_schedule);

// Route to get all inspection schedules
router.get('/', inspectionController.get_all_inspection_schedules);

// Route to get a single inspection schedule by ID
router.get('/:id', inspectionController.get_inspection_schedule);

// Route to update an inspection schedule by ID
router.put('/:id', inspectionController.update_inspection_schedule);

// Route to delete an inspection schedule by ID
router.delete('/:id', inspectionController.delete_inspection_schedule);

module.exports = router;
