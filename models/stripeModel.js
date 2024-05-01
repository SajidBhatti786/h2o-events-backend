const mongoose = require('mongoose');

// Define schema for Stripe account information
const stripeAccountSchema = new mongoose.Schema({
  stripeAccountId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the user model if applicable
  },
  connectedAccountId:{
    type: String,
    
   
    defaultValue: '',
  }
//   emailAddress: {
//     type: String,
//     required: true,
//   },
//   country: {
//     type: String,
//     required: true,
//   },
//   businessName: {
//     type: String,
//     required: true,
//   },
//   businessType: {
//     type: String,
//     required: true,
//   },
//   businessAddress: {
//     type: String,
//     required: true,
//   },
//   bankAccount: {
//     accountHolderName: String,
//     accountNumber: String,
//     routingNumber: String,
//     bankName: String,
//   },
//   cardPaymentsEnabled: {
//     type: Boolean,
//     default: false,
//   },
//   transfersEnabled: {
//     type: Boolean,
//     default: false,
//   },
//   payoutsEnabled: {
//     type: Boolean,
//     default: false,
//   },
//   payoutSchedule: {
//     delayDays: Number,
//     interval: String,
//   },
//   verificationStatus: {
//     type: String,
//     enum: ['verified', 'pending'],
//     default: 'pending',
//   },
//   balance: {
//     current: Number,
//     available: Number,
//     pending: Number,
//   },
});

// Create model for Stripe account
const StripeAccount = mongoose.model('Stripe', stripeAccountSchema);

module.exports = StripeAccount;
