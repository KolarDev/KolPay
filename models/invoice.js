const mongoose = require('mongoose');
const User = require('./../models/userModel');

const invoiceSchema = new mongoose.Schema({
  // userId: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User",
  //     required: true
  // },
  // transactionType: {
  //     type: String,
  //     enum: ["deposit", "withdrawal", "transfer"],
  //     required: true
  // },
  // amount: {
  //     type: Number,
  //     required: true
  // },
  date: {
    type: Date,
    default: Date.now(),
  },
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
