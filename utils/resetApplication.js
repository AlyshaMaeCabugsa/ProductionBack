// utils/resetApplications.js
const cron = require('node-cron');
const Application = require('../models/Application'); // Adjust the path as necessary
const { io } = require('../websocketServer'); // Ensure correct path
const applicationSockets = require('../applicationSockets'); // Ensure correct path

// This function will reset application statuses after the inspection date has passed
const resetApplications = () => {
  cron.schedule('0 0 * * *', async () => {
    const now = new Date();
    const updates = await Application.find(
      { inspectionSchedule: { $lt: now }, status: { $ne: 'Completed' } }
    );

    if (updates.length > 0) {
      await Promise.all(updates.map(async (app) => {
        app.status = 'Needs Review';
        app.inspectionSchedule = null;
        await app.save();
        applicationSockets.emitApplicationUpdate(io, app._id.toString()); // Emitting update for each application
      }));
      
      console.log('Applications reset:', updates.length);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Manila"
  });

  console.log('Cron job for resetting applications is set up.');
};

module.exports = resetApplications;

