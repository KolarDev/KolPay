const { verifySignature } = require('../utils/webhookUtils');
const transactions = require('../models/transactions'); // Replace with your DB model

exports.handleWebhook = async (req, res) => {
  const signature = req.headers['verif-hash'];
  const secretHash = process.env.FLW_SECRET_HASH;

  // Verify webhook signature
  if (!verifySignature(signature, secretHash)) {
    return res.status(403).send('Invalid webhook signature');
  }

  const { event, data } = req.body;

  if (!event || !data) {
    return res.status(400).send('Invalid webhook payload');
  }

  try {
    // Handle webhook based on the event type
    switch (event) {
      case 'transfer.completed':
        await handleTransferCompleted(data);
        break;

      case 'transfer.failed':
        await handleTransferFailed(data);
        break;

      case 'transaction.successful':
        await handleTransactionSuccessful(data);
        break;

      case 'transaction.failed':
        await handleTransactionFailed(data);
        break;

      default:
        console.warn(`Unhandled webhook event type: ${event}`);
    }

    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Internal server error');
  }
};

// Function to handle transfer completed event
const handleTransferCompleted = async (data) => {
  console.log('Handling transfer completed:', data);

  const updatedTransaction = await transactions.findOneAndUpdate(
    { transactionId: data.reference },
    { status: 'completed', flutterwaveResponse: data },
    { new: true },
  );

  if (updatedTransaction) {
    console.log(`Transaction ${data.reference} marked as completed`);
  } else {
    console.error(`Transaction not found: ${data.reference}`);
  }
};

// Function to handle transfer failed event
const handleTransferFailed = async (data) => {
  console.log('Handling transfer failed:', data);

  const updatedTransaction = await transactions.findOneAndUpdate(
    { transactionId: data.reference },
    { status: 'failed', flutterwaveResponse: data },
    { new: true },
  );

  if (updatedTransaction) {
    console.log(`Transaction ${data.reference} marked as failed`);
  } else {
    console.error(`Transaction not found: ${data.reference}`);
  }
};

// Function to handle successful payment transactions
const handleTransactionSuccessful = async (data) => {
  console.log('Handling successful transaction:', data);

  const updatedTransaction = await transactions.findOneAndUpdate(
    { transactionId: data.reference },
    { status: 'success', flutterwaveResponse: data },
    { new: true },
  );

  if (updatedTransaction) {
    console.log(`Transaction ${data.reference} marked as successful`);
  } else {
    console.error(`Transaction not found: ${data.reference}`);
  }
};

// Function to handle failed payment transactions
const handleTransactionFailed = async (data) => {
  console.log('Handling failed transaction:', data);

  const updatedTransaction = await transactions.findOneAndUpdate(
    { transactionId: data.reference },
    { status: 'failed', flutterwaveResponse: data },
    { new: true },
  );

  if (updatedTransaction) {
    console.log(`Transaction ${data.reference} marked as failed`);
  } else {
    console.error(`Transaction not found: ${data.reference}`);
  }
};
