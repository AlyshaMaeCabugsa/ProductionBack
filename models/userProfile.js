// userProfile.js
const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // This assumes your UserDetails model is named 'User'
    required: true
  },
  ownerName: String,
  establishmentName: String,
  tradeName: String,
  address: String,
  contactNumber: String,
  //profileComplete: { type: Boolean, default: false }
});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);
module.exports = UserProfile;
