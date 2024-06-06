const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OTPSchema = new Schema({
  email: String,
  otp: String,
  isUsed: Boolean,
  expiresAt: Date,
});

module.exports = mongoose.model('OTP', OTPSchema);
