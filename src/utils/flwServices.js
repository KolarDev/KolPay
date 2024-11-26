const Flutterwave = require('flutterwave-node-v3');

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY,
);

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

const refund = async () => {
  try {
    const payload = {
      id: '5708', //This is the transaction unique identifier. It is returned in the initiate transaction call as data.id
      amount: '10',
    };
    const response = await flw.Transaction.refund(payload);
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  get_fee,
  resendHooks,
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
