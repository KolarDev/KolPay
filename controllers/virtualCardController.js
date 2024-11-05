const AppError = require('../utils/appError');
const Transaction = require('./../models/transactionModel');
const VirtualCard = require('./../models/virtualCard');
const { getAllAndQuery } = require('./../controllers/factoryHandler');
const User = require('./../models/userModel');
const Email = require('./../utils/notificator');
const { findOneAndDelete } = require('../models/invoiceModel');

// User add virtual card details
const addVirtualCard = async (req, res, next) => {
  const { cardNumber, expiryDate, cvv, cardHolderName, balance, currency } =
    req.body;

  const newCard = await VirtualCard.create({
    user: req.user._id,
    cardNumber,
    expiryDate,
    cvv,
    cardHolderName,
    balance,
    currency,
  });

  res.status(201).json({
    status: 'success',
    data: {
      newCard,
    },
  });
};

// User get his virtual card details
const myVirtualCard = async (req, res, next) => {
  const { userId } = req.params.id;
  const card = await VirtualCard.findOne({ user: userId });

  if (!card) return next('Virtual card not found!', 404);

  res.status(200).json({
    status: 'success',
    data: {
      cardNumber: card.decryptedCardNumber,
      cvv: card.decryptedCvv,
      expiryDate: card.expiryDate,
      balance: card.balance,
      status: card.status,
    },
  });
};

// Admin get all virtual card details
const allVirtualCards = async (req, res, next) => {
  const virtualCards = await VirtualCard.find();

  if (!virtualCards) return next('No Virtual card found!', 404);

  res.status(200).json({
    status: 'success',
    data: {
      virtualCards,
    },
  });
};

// Edit Card details
const editCardDetails = async (req, res, next) => {
  const { cardNumber, expiryDate, cvv, cardHolderName, balance, currency } =
    req.body;

  const virtualCard = await VirtualCard.findByIdAndUpdate(
    req.user._id,
    { cardNumber, expiryDate, cvv, cardHolderName, balance, currency },
    { validateBeforeSave: true },
  );

  if (!virtualCard) return next('No Virtual card found!', 404);

  res.status(200).json({
    status: 'success',
    data: {
      virtualCard,
    },
  });
};

// Delete Card details
const deleteCardDetails = async (req, res, next) => {
  const virtualCard = await findOneAndDelete({ user: req.user._id });

  if (!virtualCard) return next('No Virtual card found!', 404);

  res.status(200).json({
    status: 'success',
    data: {
      virtualCard,
    },
  });
};

module.exports = {
  addVirtualCard,
  myVirtualCard,
  allVirtualCards,
  editCardDetails,
  deleteCardDetails,
};
