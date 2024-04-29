const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inspectionScheduleSchema = new Schema({
  establishment: {
    type: Schema.Types.ObjectId,
    ref: 'Establishment',
    required: true // Now required, to ensure an establishment is always linked.
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  inspector: {
    name: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: false // Optional, depends on whether you have inspector IDs.
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  notes: {
    type: String,
    required: false // Optional, notes may not always be needed.
  },
  // Add the notified field to track if a reminder has been sent
  notified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const InspectionSchedule = mongoose.model('InspectionSchedule', inspectionScheduleSchema);

module.exports = InspectionSchedule;

