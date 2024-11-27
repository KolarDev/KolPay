const mongoose = require('mongoose');
const User = require('./../models/userModel');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  transactionType: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  refunded: {
    type: Boolean,
    default: false,
  },
  flwdetails: {
    type: mongoose.Schema.Types.Mixed,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
