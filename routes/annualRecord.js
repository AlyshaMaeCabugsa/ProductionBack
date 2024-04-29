const express = require('express');
const router = express.Router();
const annualRecordController = require('../controller/annualRecordController');
const establishmentController = require('../controller/establishmentController');

// POST endpoint for creating a new annual record
router.post('/', annualRecordController.createAnnualRecord);

// GET endpoint for retrieving all annual records
router.get('/', annualRecordController.getAllAnnualRecords);

router.get('/:id', establishmentController.getEstablishmentById);

// GET endpoint for retrieving annual records by a specific year
router.get('/year/:year', annualRecordController.getAnnualRecordsByYear);

// PUT endpoint for updating an existing annual record by ID
router.put('/:id', annualRecordController.updateAnnualRecord);

// DELETE endpoint for deleting an existing annual record by ID
router.delete('/:id', annualRecordController.deleteAnnualRecord);

module.exports = router;

