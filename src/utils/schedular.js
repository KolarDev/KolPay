const cron = require('node-cron');

// Background job to run every hour
cron.schedule('0 * * * *', () => {
  refundFailedTransactions();
});

const refundFailedTransactions = () => {};
