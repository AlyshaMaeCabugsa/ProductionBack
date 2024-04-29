// routes/establishment.js
const express = require('express');
const router = express.Router();
const establishmentController = require('../controller/establishmentController');

// Place the specific routes before the parameterized ones

router.get('/search-suggestions', establishmentController.getSearchSuggestions);
router.get('/history/:searchTerm', establishmentController.fetchEstablishmentHistoryBySearch);
router.get('/history', establishmentController.fetchEstablishmentHistoryBySearch);

// Create a new establishment
router.post('/', establishmentController.createEstablishment);

router.get('/search', establishmentController.searchEstablishments);

// Get all establishments
router.get('/', establishmentController.getAllEstablishments);

// Specific establishment routes
router.get('/:id', establishmentController.getEstablishmentById);
router.put('/:id', establishmentController.updateEstablishment);
router.delete('/:id', establishmentController.deleteEstablishment);

module.exports = router;
