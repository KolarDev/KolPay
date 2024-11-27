const express = require('express');
const adminController = require('./../controllers/adminController');
const { protectRoute, adminAuth } = require('./../middlewares/authorize');
const { webhooks } = require('./../utils/flwServices');
const {
  transferInter,
  transfer,
  deposit,
  withdrawal,
  getATransfer,
  getBanks,
  getAllTransactions,
  transactionsHistory,
  verifyFlutterwaveSignature,
} = require('./../controllers/transactionController');

const router = express.Router();

// protect route for only loggedIn users
router.use(protectRoute);

router.get('/all-banks', getBanks);
router.get('/a-transfer', getATransfer);

router.post('/deposit', deposit); // deposit funds to kolpay

router.post('/withdrawal', withdrawal); // withdraw funds from kolpay to kolpay

router.post('/transfer', transfer); // transfer funds from kolpay to kolpay

router.post('/transfer-inter', verifyFlutterwaveSignature, transferInter); // transfer funds from kolpay to other banks (Inter-bank)
router.post('/webhooks', verifyFlutterwaveSignature, webhooks); // refund failed transactions webhook endpoint triggered by flutterwave

// Get user transaction history
router.get('/all-transactions', getAllTransactions);
router.get('/history', transactionsHistory);

module.exports = router;
