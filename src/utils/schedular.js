const cron = require('node-cron');
const Transaction = require('./../models/transactionModel');
const { processRefund } = require('./flwServices');

// Background job to run every hour
cron.schedule('0 * * * *', () => {
  refundFailedTransactions();
});

const refundFailedTransactions = async () => {
  // Fetch failed transactions from your database
  const failedTransfers = await Transaction.find({
    status: 'failed',
    refunded: false,
  });

  if (failedTransfers) {
    for (const transfer of failedTransfers) {
      const refundResult = await processRefund(
        transfer.id, //// the actual transaction id
        transfer.userId,
        transfer.amount,
      );

      if (refundResult.success) {
        // Mark the transaction as refunded
        transfer.refunded = true;
        await transfer.save();
      }
    }
  }
};
