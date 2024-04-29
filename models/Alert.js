// models/Alert.js

const mongoose = require('mongoose');


const AlertSchema = new mongoose.Schema({
  message: String,
  type: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', AlertSchema);


