// services/notificationSocket.js
const cron = require('node-cron');
const InspectionSchedule = require('../models/InspectionSchedule');
const StaffContact = require('../models/StaffContact'); // Make sure the path is correct
const smsService = require('./smsService'); // The SMS service you created earlier

const scheduleNotifications = (io) => {
  cron.schedule('* * * * *', async () => {     // Checks every 30 minutes
    const now = new Date();
    const reminderThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const inspections = await InspectionSchedule.find({
      date: { $lte: reminderThreshold },
      notified: false, // Ensure we're only getting inspections that haven't been notified
    });

    if (inspections.length) {
      const staffContacts = await StaffContact.find().select('phoneNumber -_id'); // Select only the phoneNumber field and exclude _id
      const phoneNumbers = staffContacts.map(contact => contact.phoneNumber);

      // Prepare a generic message or customize it per inspection
      const message = 'Reminder: You have an upcoming inspection scheduled within the next 24 hours.';

      // Send an SMS to all staff contacts
      await smsService.sendSMSToMultipleRecipients(phoneNumbers, message);
    }

    inspections.forEach(inspection => {
      // Emit an event to notify about the inspection
      io.emit('inspectionNotification', {
        message: `Upcoming inspection reminder for ${inspection.establishment}.`,
        inspection,
      });

      // Update the inspection to mark it as notified
      InspectionSchedule.findByIdAndUpdate(inspection._id, { notified: true }).exec();
    });
  });
};

module.exports = { scheduleNotifications };

