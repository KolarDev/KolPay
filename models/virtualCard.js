const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const virtualCardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cardNumber: {
      type: Number,
      required: true,
    },
    expiryDate: {
      type: Date,
      require: true,
    },
    cvv: {
      type: String,
      required: true,
    },
    cardHolderName: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'NGN',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      default: 'active',
    },
    createdAt: {
      type: String,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

virtualCardSchema.pre();

const VirtualCard = mongoose.model('User', virtualCardSchema);

module.exports = VirtualCard;
