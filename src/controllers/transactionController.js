const Flutterwave = require('flutterwave-node-v3');
const AppError = require('../utils/appError');
const Transaction = require('./../models/transactionModel');
const { getAllAndQuery } = require('./../controllers/factoryHandler');
const User = require('./../models/userModel');
const Email = require('./../utils/notificator');
const { generateTransferReference } = require('./../utils/generator');

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY,
);

const verifyFlutterwaveSignature = (req, res, next) => {
  const secretHash = process.env.FLW_SECRET_HASH;
  const signature = req.headers['verif-hash'];

  // Compare signature with the secret hash
  if (!signature || signature !== secretHash) {
    return next(new AppError('Unauthorized request', 401));
  }

  next(); // Request is verified, proceed to handle it
};

// Initiate Transfer Function
const initiateTransfer = async (payload) => {
  try {
    const response = await flw.Transfer.initiate(payload);
    // return response;
  } catch (error) {
    res.status(500).json({
      status: 'Failed!',
      message: 'Error Initiating your transfer!',
    });
    console.log(error);
  }
};

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
    const transferResponse = await initiateTransfer(payload);
    console.log(transferResponse);

    if (transferResponse.status === 'success') {
      // Deduct the amount from user's balance
      user.balance -= amount;
      await user.save();

      const transaction = await Transaction.create({
        userId: req.user.id,
        transactionType: 'transfer',
        amount,
        status: `${transferResponse.status}`,
      });

      res.status(200).json({
        status: 'success',
        message: 'Transfer successful, balance updated',
        data: {
          transferResponse,
          transaction,
        },
      });
    } else {
      res
        .status(400)
        .json({ error: 'Transfer failed', data: transferResponse });
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
const getAllTransactions = getAllAndQuery(Transaction);

//              Transaction Receipt

const receipt = (user, transaction) => {
  return `
    *** Transaction Receipt ***
    ${transaction.status}
    ----------------------------

    Account Name: ${user.fullname}

    Transaction Type: ${transaction.transactionType.toUpperCase()}

    Amount: ₦${transaction.amount.toFixed(2)}

    Date: ${transaction.date.toLocaleString()}

    Balance: ₦${user.balance.toFixed(2)}

    Transaction ID: ${transaction._id}

    ----------------------------

    Thank you for your transacting with KolPay🤝.
  `;
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
  verifyFlutterwaveSignature,
};
