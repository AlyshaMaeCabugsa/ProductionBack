// controllers/applicationController.js

const { io } = require('../websocketServer');
const Application = require('../models/Application'); // Import the model
const { emitApplicationUpdate } = require('../applicationSockets');



// Function to get all applications
exports.getApplications = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;  // Default limit to 10 if not specified
    const offset = parseInt(req.query.offset) || 0;  // Default offset to 0 if not specified

    const applications = await Application.find({})
                                          .skip(offset)
                                          .limit(limit);
    const total = await Application.countDocuments();  // Count the total documents for pagination

    res.status(200).json({ applications, total });  // Send both the applications array and total count
  } catch (error) {
    res.status(500).send({ message: 'Error fetching applications', error: error });
  }
};

// Function to update the application status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;
    const application = await Application.findByIdAndUpdate(applicationId, { status }, { new: true });

    if (application) {
      // Emit the application update after the status has been successfully updated
      emitApplicationUpdate(io, application._id.toString());
      res.status(200).send(application);
    } else {
      res.status(404).send({ message: "Application not found" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
};


exports.scheduleInspection = async (req, res) => {
  try {
    const { inspectionSchedule } = req.body;
    const applicationId = req.params.id;
    const application = await Application.findByIdAndUpdate(applicationId, { inspectionSchedule }, { new: true });

    if (application) {
      // Emit the application update after the inspectionSchedule has been successfully updated
      emitApplicationUpdate(io, application._id.toString());
      res.status(200).send(application);
    } else {
      res.status(404).send({ message: "Application not found" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { status, inspectionSchedule } = req.body;
    const update = {};

    if (status) {
      update.status = status;
    }

    if (inspectionSchedule) {
      update.inspectionSchedule = new Date(inspectionSchedule);
    }

    if (status === 'Approved' && inspectionSchedule != null) {
      update.archived = true;
    }

    const application = await Application.findByIdAndUpdate(req.params.id, update, { new: true });

    if (!application) {
      return res.status(404).send({ message: "Application not found" });
    }

    res.status(200).send(application);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).send({ message: "Failed to update application", error: error.message });
  }
};



module.exports = exports;
