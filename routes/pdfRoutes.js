const express = require('express');
const router = express.Router();
const pdfController = require('../controller/pdfController');

// Route for filling a specific PDF based on template name
router.post('/fill-pdf/:template', pdfController.fillPDFByTemplateName);

module.exports = router;





