const mongoose = require('mongoose');
const User = require('./../models/userModel');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  transactionId: {
    // for transfer
    type: String,
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
  recipientAccount: {
    // for transfer
    type: String,
  },
  recipientBank: {
    // for transfer
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed'],
    required: true,
  },
  refunded: {
    type: Boolean,
    default: false,
  },
  flutterwaveResponse: {
    type: mongoose.Schema.Types.Mixed,
  },
  narration: {
    type: String,
    minLength: [4, 'Narration can not be less than 4 characters'],
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
