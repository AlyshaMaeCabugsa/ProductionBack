const cron = require('node-cron');
const InspectionSchedule = require('../models/InspectionSchedule');
const io = require('../websocketServer'); // Make sure this path is correct
const Establishment = require('../models/Establishment'); // If needed for population

async function sendDailyInspectionReminders() {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const schedules = await InspectionSchedule.find({
      date: { $eq: tomorrow.toISOString().split('T')[0] }
    }).populate('establishment');

    schedules.forEach(schedule => {
      const reminderMessage = `You have an inspection schedule tomorrow on ${schedule.date} at ${schedule.time} for ${schedule.establishment.tradeName}`;
      io.emit('notifyAdmin', { message: reminderMessage });
    });
  } catch (error) {
    console.error('Error sending daily inspection reminders:', error);
  }
}

// Schedule the task to run every day at 8 AM Manila Time
cron.schedule('0 8 * * *', sendDailyInspectionReminders, {
  scheduled: true,
  timezone: "Asia/Manila"
});

module.exports = {
  sendDailyInspectionReminders
};


