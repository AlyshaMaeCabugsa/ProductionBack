// userDetails.js
const mongoose = require("mongoose");

const userDetailsSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  email: { type: String, unique: true },
  password: String,
  userType: String,
  profileComplete: { type: Boolean, default: false } // Ensure this line is there
}, {
  collection: "UserInfo"
});

const User = mongoose.model("User", userDetailsSchema);
module.exports = User;

