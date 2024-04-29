const express = require('express');
const router = express.Router();
const pdfApplicationController = require('../controller/pdfApplication');

router.post('/applications/:id/upload-pdf', pdfApplicationController.uploadApplicationPdf, pdfApplicationController.saveApplicationPdf);

router.get('/applications/ready-for-upload', pdfApplicationController.getApplicationsReadyForUpload);

router.get('/applications/:id/download-pdf', pdfApplicationController.downloadApplicationPdf);



module.exports = router;

