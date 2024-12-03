const Flutterwave = require('flutterwave-node-v3');
const Email = require('./notificator');
const logger = require('./../../logger');

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY,
);

// verify Flutterwave Signature
const verifyFlwSignature = (req, res, next) => {
  const secretHash = process.env.FLW_SECRET_HASH;
  const signature = req.headers['verif-hash'];

  // Compare signature with the secret hash
  if (!signature || signature !== secretHash) {
    return next(new AppError('Invalid Webhook Signature!', 403));
  }

  next(); // Request is verified, proceed to handle it
};

// Get the flutterwave charges on the transaction bieng made
const get_fee = async (amount) => {
  try {
    const payload = {
      amount,
      currency: 'NGN',
    };
    const response = await flw.Transaction.fee(payload);
    return response.data.fee;
  } catch (error) {
    console.log(error);
  }
};

const resendHooks = async (tx_ref) => {
  try {
    const payload = {
      tx_ref: tx_ref,
    };
    await flw.Transaction.resend_hooks(payload);
  } catch (error) {
    console.log(error);
  }
};

const processRefund = async (transferId, userId, amount) => {
  try {
    const transferStatus = await checkTransferStatus(transferId); // check the status of the transfer

    if (transferStatus === 'failed') {
      const payload = {
        id: transferId,
        amount,
      };

      const response = await flw.Transaction.refund(payload);

      if (response.status === 'success') {
        // Notify the user about the refund
        // await new Email(userId, response.data).sendRefundNotification();

        return { status: 'success', data: response.data };
      } else {
        console.error('Refund failed:', response.message);
        return { status: 'failed', message: response.message };
      }
    }

    return { status: 'failed', message: "Transfer status is not 'FAILED'" };
  } catch (error) {
    console.error('Error processing refund:', error);
    return { status: 'failed', message: 'Error processing refund' };
  }
};

const checkTransferStatus = async (transferId) => {
  try {
    const payload = { id: transferId };
    const response = await flw.Transfer.get(payload);
    return response.data.status; // Status: 'success' or 'failed'
  } catch (error) {
    console.error('Error checking transfer status:', error);
    return null;
  }
};

// Function to get the name of the bank
const getBankName = async (bankCode) => {
  try {
    const payload = {
      country: 'NG',
    };

    const response = await flw.Bank.country(payload);

    if (response && response.data) {
      // Filter the list to find the bank with the specified bank code
      const bank = response.data.find((bank) => bank.code === bankCode);

      if (bank) {
        console.log(`Bank found: ${bank.name}`);
        return bank.name;
      } else {
        console.error(`Bank with code ${bankCode} not found.`);
        return null;
      }
    } else {
      console.error('Unable to fetch banks or invalid response format.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching banks:', error);
    return null;
  }
};

module.exports = {
  get_fee,
  getBankName,
  resendHooks,
  processRefund,
  verifyFlwSignature,
};

// const initTrans = async () => {
//   try {
//     const payload = {
//       account_bank: '044', //This is the recipient bank code. Get list here :https://developer.flutterwave.com/v3.0/reference#get-all-banks
//       account_number: '0690000040',
//       amount: 5500,
//       narration: 'Akhlm Pstmn Trnsfr xx007',
//       currency: 'NGN',
//       reference: 'akhlm-pstmnpyt-r02ens007_PMCKDU_1', //This is a merchant's unique reference for the transfer, it can be used to query for the status of the transfer
//       callback_url: 'https://www.flutterwave.com/ng/',
//       debit_currency: 'NGN',
//     };

//     const response = await flw.Transfer.initiate(payload);
//     console.log(response);
//   } catch (error) {
//     console.log(error);
//   }
// };

// app.post("/flw-webhook", async (req, res) => {
// 	Try{
// 		// Check for the signature
// const secretHash = process.env.FLW_SECRET_HASH;
// const signature = req.headers["verif-hash"];
// If (!signature || signature !== secretHash){
// 	// This response is not from Flutterwave; discard
// 	return res.status(401).end();
// }
// const payload = req.body;
// 		console.log(payload);
// 		res.status(200).end();

// } catch (err) {
// 	console.log(err.code);
// 	console.log(err.response.body);
// }
// });
