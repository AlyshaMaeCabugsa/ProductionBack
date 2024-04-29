// models/StaffMember.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const staffMemberSchema = new Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true }
}, { timestamps: true });

const StaffMember = mongoose.model('StaffMember', staffMemberSchema);

module.exports = StaffMember;
