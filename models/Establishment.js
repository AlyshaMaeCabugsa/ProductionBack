const mongoose = require('mongoose');

const establishmentSchema = new mongoose.Schema({
  uniqueNumber: { type: String, required: false, unique: true, sparse: true },
  tradeName: { type: String, required: true },
  ownerRepresentative: { type: String, required: true },
  address: { type: String, required: true },
  typeOfOccupancy: { type: String, required: true },
  // Add any other fields that are common to all establishments
});

const Establishment = mongoose.model('Establishment', establishmentSchema);

module.exports = Establishment;
