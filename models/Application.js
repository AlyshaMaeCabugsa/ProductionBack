const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Add this line
  ownerName: String,
  establishmentName: String,
  tradeName: String,
  address: String,
  contactNumber: String,
  authorizedRepresentative: String,
  businessIdentificationNumber: { type: String, default: '' },
  typeOfOccupancy: String,
  status: { type: String, default: 'Pending' },
  inspectionSchedule: Date,
  pdfFile: {
    data: Buffer,
    contentType: { type: String, default: 'application/pdf' },
    name: String,
  },
  archived: { type: Boolean, default: false },
}, { timestamps: true
  // ... any other fields you might have ...
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;

