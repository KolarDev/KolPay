const Transaction = require('./../models/transactionModel');
const User = require('./../models/userModel');
const Invoice = require('./../models/invoiceModel');
const { getAllAndQuery } = require('./../controllers/factoryHandler');
const AppError = require('../utils/appError');
const Email = require('./../utils/notificator');

// ---Get User Invoice Route
const createInvoice = async (req, res, next) => {
  try {
    // 1. Get required invoice request info
    const userId = req.user.id;
    const { startDate, endDate } = req.body;

    // 2. Actually generate invoice
    const invoice = await generateInvoice(userId, { startDate, endDate });

    // 3. Provide invoice in the response
    res.status(200).json({
      status: 'success',
      data: {
        invoice,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'failed !',
      message: 'Error proccessing invoice !',
      error,
    });
  }
};

// --Invoice Generation Function--
const generateInvoice = async (userId, dateRange) => {
  try {
    // 1. Fetch user's transaction within 1 month
    const transactions = Transaction.find({
      user: userId,
      date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
    });
    if (!transactions.length) {
      return new AppError('No transaction found for that period');
    }

    // 2. Calculate the total amount of transactions
    const totalAmount = transactions.reduce((acc, transaction) => {
      acc + transaction.amount;
    }, 0);
    // 3. Set duedate for invoice generation (7 days)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    // 4. Create the Invoice data
    const invoiceData = {
      user: userId,
      transactions: transactions.map((transaction) => ({
        transactionId: transaction._id,
        transactionType: transaction.transactionType,
        amount: transaction.amount,
        date: transaction.date,
      })),
      totalAmount,
      dueDate,
    };
    // 5. Save the invoice to the database
    const newInvoice = new Invoice(invoiceData);
    await newInvoice.save();
    // 6. Invoice will be authomatically sent to user (Handled by the scheduler)
  } catch (error) {
    throw new Error(`Failed to generate invoice: ${error.message}`);
  }
};

// Get invoice data by invoiceId
const getMyInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id });

    if (!invoices) return next(new AppError('No invoice found!', 404));

    res.status(200).json({
      status: 'success',
      data: {
        invoices,
      },
    });
  } catch (error) {
    throw new Error(`Failed to retrieve invoices: ${error.message}`);
  }
};

// Get invoice data by invoiceId
const getInvoice = async (req, res, next) => {
  try {
    const { invoiceId } = req.params.id;

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice)
      return next(new AppError('No invoice found for that Id!', 404));

    res.status(200).json({
      status: 'success',
      data: {
        invoice,
      },
    });
  } catch (error) {
    throw new Error(`Failed to retrieve invoice: ${error.message}`);
  }
};

// Deleting an invoice data.
const deleteInvoice = async (req, res, next) => {
  try {
    const { invoiceId } = req.params.id;

    // access logic hereeeeeeeeeeeeeee

    const invoice = await Invoice.findByIdAndDelete(invoiceId);

    if (!invoice)
      return next(new AppError('No invoice found for that Id!', 404));
    res.status(204).json({
      status: 'success',
      message: 'Invoice deleted!',
      data: null,
    });
  } catch (error) {
    throw new Error(`Failed to delete invoice: ${error.message}`);
  }
};

const getAllInvoices = getAllAndQuery(Invoice);

module.exports = {
  getAllInvoices,
  createInvoice,
  getMyInvoices,
  getInvoice,
  deleteInvoice,
};
