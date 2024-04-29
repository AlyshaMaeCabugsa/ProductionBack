const InspectionSchedule = require('../models/InspectionSchedule');
const Establishment = require('../models/Establishment');
const Alert = require('../models/Alert');
const { io } = require('../websocketServer');

exports.create_inspection_schedule = async (req, res) => {
  try {
    const { establishmentId, date, time } = req.body;

    const establishment = await Establishment.findById(establishmentId);
    if (!establishment) {
      return res.status(404).send({ message: 'Establishment not found.' });
    }

    const existingSchedule = await InspectionSchedule.findOne({
      establishment: establishmentId,
      date: date,
      time: time,
    });

    if (existingSchedule) {
      return res.status(400).send({ message: 'An inspection schedule already exists for this establishment on the given date and time.' });
    }

    const inspectionSchedule = new InspectionSchedule({
      establishment: establishment._id,
      date: date,
      time: time,
      inspector: req.body.inspector,
      status: req.body.status,
      notes: req.body.notes,
    });

    await inspectionSchedule.save();

    const populatedInspectionSchedule = await InspectionSchedule.findById(inspectionSchedule._id).populate('establishment');
    const newAlert = new Alert({
      message: `New inspection scheduled for ${populatedInspectionSchedule.establishment.tradeName}`,
      type: 'New Inspection'
    });

    await newAlert.save();
    io.emit('newInspectionAlert', newAlert);
    res.status(201).send(populatedInspectionSchedule);
  } catch (error) {
    console.error("Error creating inspection schedule:", error);
    res.status(500).send({ message: error.message });
  }
};


exports.get_all_inspection_schedules = async (req, res, next) => {
  const { status } = req.query;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    let filters = {};
    // Check if status is exactly 'Scheduled' or 'Completed'
    if (status === 'Scheduled' || status === 'Completed') {
      filters.status = status;

      if (status === 'Completed') {
        // Make sure to compare dates only, without time
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        filters.date = { $gte: thirtyDaysAgo };
      }
    } else {
      // Handle case with no status or status is not 'Scheduled'/'Completed'
      filters.$or = [
        { status: { $ne: 'Completed' } },
        { 
          status: 'Completed',
          date: { $gte: thirtyDaysAgo }
        }
      ];
    }

    console.log(`Filters applied: ${JSON.stringify(filters)}`); // Add for debugging

    const schedules = await InspectionSchedule.find(filters).populate('establishment', 'tradeName address');
    res.status(200).send(schedules);
  } catch (error) {
    console.error('Error getting inspection schedules:', error);
    res.status(500).send({ message: error.message });
  }
};



exports.get_inspection_schedule = async (req, res, next) => {
  try {
    const schedule = await InspectionSchedule.findById(req.params.id).populate('establishment', 'tradeName address');
    if (!schedule) {
      return res.status(404).send({ message: 'Inspection Schedule not found.' });
    }
    res.status(200).send(schedule);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.update_inspection_schedule = async (req, res) => {
  try {
    const schedule = await InspectionSchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Directly populate on update
    );

    if (!schedule) {
      return res.status(404).send({ message: 'Inspection Schedule not found.' });
    }

    const populatedSchedule = await InspectionSchedule.findById(schedule._id).populate('establishment');

    if (req.body.status === 'Completed' && populatedSchedule.establishment) {
      // Use populatedSchedule.establishment.tradeName to access the trade name
      const completionAlert = new Alert({
        message: `Completed: ${populatedSchedule.establishment.tradeName}`,
        type: 'Completion',
        date: new Date(populatedSchedule.date)
      });

      await completionAlert.save();

      // Now we use the correct populatedSchedule object
    io.emit('recentInspectionUpdate', {
        message: `Inspection completed for ${populatedSchedule.establishment.tradeName}`,
        date: populatedSchedule.date,
        establishment: populatedSchedule.establishment.tradeName
      });
      io.emit('notifyAdmin', completionAlert);
    }

    res.status(200).send(populatedSchedule);
  } catch (error) {
    console.error("Error updating inspection schedule:", error);
    res.status(500).send({ message: error.message });
  }
};

exports.delete_inspection_schedule = async (req, res) => {
  try {
    const deletedSchedule = await InspectionSchedule.findByIdAndRemove(req.params.id);
    
    if (deletedSchedule) {
      io.emit('inspectionDeletedAlert', {
        message: `Inspection for establishment with ID ${req.params.id} has been deleted.`,
        inspectionId: req.params.id
      });
    } else {
      return res.status(404).send({ message: 'Inspection Schedule not found.' });
    }

    res.status(200).send({ message: 'Inspection Schedule deleted successfully.' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.sendDailyInspectionReminders = async () => {
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
};