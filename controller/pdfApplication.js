const Application = require('../models/Application');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { applicationSocket } = require('../applicationSockets'); // adjust the path accordingly


exports.uploadApplicationPdf = upload.single('pdfFile');

exports.saveApplicationPdf = async (req, res) => {
  try {
    const { id } = req.params;
    
    const application = await Application.findOne({
      _id: id,
      status: 'Approved',
      inspectionSchedule: { $ne: null },
      'pdfFile.name': { $in: ['', null] }, // Adjusted to check for both empty string and null
      archived: true // The application must be archived
    });

    if (!application) {
      return res.status(404).send('Application does not meet the requirements for PDF upload.');
    }

    application.pdfFile.data = req.file.buffer;
    application.pdfFile.contentType = 'application/pdf';
    application.pdfFile.name = req.file.originalname;
    const savedApplication = await application.save();

    // Emit an update to the user's room with the PDF details
    applicationSocket.to(`user-${savedApplication.userId.toString()}`).emit('applicationUpdate', {
      id: savedApplication._id,
      pdfFileName: savedApplication.pdfFile.name
    });

    // Respond to the client that the PDF was uploaded successfully
    res.status(200).json({
      message: 'PDF uploaded successfully',
      pdfFileName: savedApplication.pdfFile.name
    });

  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error saving the application PDF:', error);
    res.status(500).send(error.message);
  }
};

exports.getApplicationsReadyForUpload = async (req, res) => {
    try {
      const applications = await Application.find({
        status: 'Approved', // Looking for applications with 'Approved' status
        inspectionSchedule: { $ne: null }, // With an inspection date set
        'pdfFile.name': { $in: ['', null] },
        archived: true
      });
  
      // Log the output to the server console to verify the results
      console.log('Applications ready for PDF upload:', applications);
      res.json(applications);
    } catch (error) {
      console.error('Error fetching applications ready for upload:', error);
      res.status(500).send("Failed to fetch applications: " + error.message);
    }
  };

  exports.downloadApplicationPdf = async (req, res) => {
    try {
      const application = await Application.findById(req.params.id);
      if (!application || !application.pdfFile.data) {
        return res.status(404).send('PDF file not found.');
      }
      
      res.contentType('application/pdf');
      res.send(application.pdfFile.data);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };

