const Flutterwave = require('flutterwave-node-v3');
const AppError = require('../utils/appError');
const Transaction = require('./../models/transactionModel');
const { getAllAndQuery } = require('./../controllers/factoryHandler');
const User = require('./../models/userModel');
const Email = require('./../utils/notificator');
const { generateTransferReference, receipt } = require('./../utils/generator');
const { getBankName } = require('./../utils/flwServices');

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY,
);

const transferInter = async (req, res, next) => {
  const {
    account_bank,
    account_number,
    amount,
    narration,
    currency,
    callback_url,
    debit_currency,
  } = req.body;

  try {
    // Find the user in the database
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(
        new AppError('User not found! Login before making transfer', 404),
      );
    }

    // Check if user has enough balance
    if (user.balance < amount) {
      return next(new AppError('Insufficient Fund!', 400));
    }

    // Validate required fields
    if (!account_bank || !account_number || !amount || !currency) {
      return next(new AppError('Input required fields!', 404));
    }

    // Generate a unique reference id for querying transfers status from flutterwave
    const reference = await generateTransferReference();
    const bankName = await getBankName(account_bank);
    // Step 1: Create a transaction record with status 'pending'
    const transaction = await Transaction.create({
      userId: user._id,
      amount,
      transactionType: 'transfer',
      recipientAccount: account_number,
      recipientBank: bankName,
      narration,
      status: 'pending',
    });
    // Prepare the payload for the transfer request
    const payload = {
      account_bank,
      account_number,
      amount,
      narration,
      currency,
      reference,
      callback_url,
      debit_currency,
    };
    console.log(payload);
    // Step 2: Initiate the transfer with the payload
    const response = await flw.Transfer.initiate(payload);
    console.log(response);

    // Step 3: Update the transaction with Flutterwave's response
    transaction.flutterwaveResponse = response;
    transaction.transactionId = reference;
    transaction.status =
      response.status === 'success' ? 'processing' : 'failed';
    await transaction.save();

    // Step 4: Respond to the user
    if (response.status === 'success') {
      res.status(200).json({
        status: 'success',
        message: 'Transfer initiated successfully',
        transaction,
      });
    } else {
      res.status(400).json({
        status: 'Failed',
        message: 'Transfer initiation failed!',
        error: response.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'Failed!',
      message: 'Error processing your transfer!',
    });
    console.log(error);
  }
};

//                             Deposit Of Funds

const deposit = async (req, res, next) => {
  // Accept only these fields as request credentials
  const { userId, transactionType, amount } = req.body;

  const transaction = await Transaction.create({
    userId: req.user._id,
    transactionType: 'deposit',
    amount,
  });

  if (amount > 1000000)
    return next(new AppError("Can't deposit larger amounts!", 401));

  const user = await User.findOne({ _id: req.user._id });

  user.balance += amount;

  await user.save({ validateBeforeSave: false });

  await new Email(user, undefined, transaction).creditAlert();

  res.status(200).json({
    status: 'success',
    message: 'Transaction Successful👍',
    reciept: receipt(user, transaction),
  });
};

//                        Withdrawal Of Funds

const withdrawal = async (req, res, next) => {
  // Accept only these fields as request credentials
  const { userId, transactionType, amount } = req.body;

  const user = await User.findById(req.user.id);
  // return error if insufficient balance
  if (user.balance < amount)
    return next(new AppError('Insufficient Funds!', 401));

  // update user bance and save
  user.balance -= amount;
  await user.save({ validateBeforeSave: false });

  // Actually create the transaction
  const transaction = await Transaction.create({
    userId: req.user.id,
    transactionType: 'withdrawal',
    amount,
    status: 'success',
  });

  // send alert and transaction receipt as email
  await new Email(user, undefined, transaction).debitAlert();

  res.status(200).json({
    status: 'success',
    message: 'Transaction Successful👍',
    reciept: receipt(user, transaction),
  });
};

//            Transfer Of Funds

const transfer = async (req, res, next) => {
  // Accept only these fields as request credentials
  const { amount, recepientAccNo } = req.body;

  const sender = await User.findById(req.user.id);
  const recepient = await User.findOne({ accountNumber: recepientAccNo });

  // return error error messages
  if (!recepient) return next(new AppError('No account found!', 400));
  if (sender.balance < amount)
    return next(new AppError('Insufficient fund!', 400));

  // update balances and save
  sender.balance -= amount;
  recepient.balance += amount;
  await sender.save({ validateBeforeSave: false });
  await recepient.save({ validateBeforeSave: false });

  const transaction = await Transaction.create({
    userId: req.user.id,
    transactionType: 'transfer',
    amount,
    status: 'success',
  });

  // send transaction alert through email
  await new Email(recepient, undefined, transaction, sender).creditAlert();
  await new Email(sender, undefined, transaction, recepient).debitAlert();

  res.status(200).json({
    status: 'success',
    message: 'Transaction Successful👍',
    reciept: receipt(sender, transaction),
  });
};

const transactionsHistory = (model, popOptions) => {
  async (req, res, next) => {
    let query = model.findById(req.params.id);
    if (popOptions) query = model.findById(req.params.id).populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found for that ID !', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  };
};

// Perform all queries on transactions
const getTransactions = getAllAndQuery(Transaction);

// Get all transactions
const getAllTransactions = async (req, res, next) => {
  let { from, to } = req.body;

  if (!from || !to) {
    const now = new Date();
    // Get the date of two weeks ago
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(now.getDate() - 14);
    // Set default values
    from = twoWeeksAgo.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    to = now.toISOString().split('T')[0];
  }
  try {
    const payload = {
      from: from,
      to: to,
    };

    // To ensure payload is available before proceeding to flw function
    if (!payload) return next(new AppError('Please provide a dates', 400));
    // Now fetch the transactions
    const response = await flw.Transaction.fetch(payload);
    res.status(200).json({
      status: 'success',
      data: {
        response,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed!',
      message: 'Error fetching transactions',
    });
    console.log(error);
  }
};

// Fetch a transfer
const getATransfer = async (req, res, next) => {
  const { transferId } = req.body;
  try {
    const payload = {
      id: transferId, // This is the numeric ID of the transfer you want to fetch. It is returned in the call to create a transfer as data.id
    };

    const response = await flw.Transfer.get_a_transfer(payload);
    res.status(200).json({
      status: 'success',
      data: {
        response,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed!',
      message: 'Error fetching transfer ',
    });
    console.log(error);
  }
};

// Get List of banks
const getBanks = async (req, res) => {
  const { name } = req.query; // For querying banks by name
  try {
    const payload = { country: 'NG' };
    const response = await flw.Bank.country(payload);

    // Filter banks by name if a name parameter is provided
    let banks = response.data;
    if (name) {
      banks = banks.filter((bank) =>
        bank.name.toLowerCase().includes(name.toLowerCase()),
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        banks,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed!',
      message: 'Error fetching banks!',
    });
    console.log(error);
  }
};

module.exports = {
  transferInter,
  transfer,
  deposit,
  withdrawal,
  getATransfer,
  getBanks,
  getAllTransactions,
  transactionsHistory,
};
