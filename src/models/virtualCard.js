const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('dotenv');

const virtualCardSchema = new mongoose.Schema(
  {
    user: {
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

// Encrypt sensistive card details and save the encrypted form instead
virtualCardSchema.pre('save', function (next) {
  if (this.isModified('cardNumber')) {
    this.cardNumber = encrypt(this.cardNumber);
  }
  if (this.isModified('cvv')) {
    this.cardNumber = encrypt(this.cvv);
  }
  next();
});

// Decrypt card details when requested
virtualCardSchema.virtual('decryptedCardNumber').get(function (next) {
  return decrypt(this.cardNumber);
});
virtualCardSchema.virtual('decryptedCvv').get(function (next) {
  return decrypt(this.cvv);
});

const VirtualCard = mongoose.model('VirtualCard', virtualCardSchema);

module.exports = VirtualCard;
