const AppError = require("../utils/appError");
const Transaction = require("./../models/transactionModel");
const User = require("./../models/userModel");
const Email = require("./../utils/notificator");

//              Transaction Receipt

const receipt = (user, transaction) => {
    return  `
    *** Transaction Receipt ***
    
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
}

 
//                             Deposit Of Funds

exports.deposit = async (req, res, next) => {

     // Accept only these fields as request credentials
    const { userId, transactionType, amount } = req.body;

    const transaction = await Transaction.create({ userId: req.user._id, transactionType: "deposit", amount });

    if (amount > 1000000) return next(new AppError("Can't deposit larger amounts!", 401));
    
    const user = await User.findOne({ _id: req.user._id });

    user.balance += amount;

    await user.save({ validateBeforeSave: false });

    await new Email(user, undefined, transaction).creditAlert();

    res.status(200).json({
        status: "success",
        message: "Transaction Successful👍",
        reciept: receipt(user, transaction)
    });

}


//                        Withdrawal Of Funds

exports.withdrawal = async (req, res, next) => {

    // Accept only these fields as request credentials
    const { userId, transactionType, amount } = req.body;
    // Actually create the transaction
    const transaction = await Transaction.create({ userId: req.user.id, transactionType: "withdrawal", amount });

    const user = await User.findById(req.user.id);
    // return error if insufficient balance
    if ( isNaN(amount) || user.balance < amount) return next(new AppError("Insufficient Funds!", 401));

    // update user bance and save
    user.balance -= amount;
    await user.save({ validateBeforeSave: false });

    // send alert and transaction receipt as email
    await new Email(user, undefined, transaction).debitAlert();

    res.status(200).json({
        status: "success",
        message: "Transaction Successful👍",
        reciept: receipt(user, transaction)
    });

}

//            Transfer Of Funds

exports.transfer = async (req, res, next) => {

     // Accept only these fields as request credentials
    const { amount, recepientAccNo } = req.body;

    const sender = await User.findById(req.user.id);
    const recepient = await User.findOne({ accountNumber: recepientAccNo });

    // return error error messages
    if (!recepient) return next(new AppError("No account found!", 400));
    if (sender.balance < amount) return next(new AppError("Insufficient fund!", 400));

    const transaction = await Transaction.create({ userId: req.user.id, transactionType: "transfer", amount });

    // update balances and save
    sender.balance -= amount;
    recepient.balance += amount;
    await sender.save({ validateBeforeSave: false }); 
    await recepient.save({ validateBeforeSave: false });
    
    // send transaction alert through email
    await new Email(recepient, undefined, transaction, sender).creditAlert();
    await new Email(sender, undefined, transaction, recepient).debitAlert();


    res.status(200).json({
        status: "success",
        message: "Transaction Successful👍",
        reciept: receipt(sender, transaction)
    });

}


exports.transactionsHistory = (model, popOptions) => {
    async (req, res, next) => {

        let query = model.findById(req.params.id);
        if (popOptions) query = model.findById(req.params.id).populate(popOptions);

        const doc = await query;
    
        if (!doc) {
            return next(new AppError("No document found for that ID !", 404));
        }
    
        res.status(200).json({
            status: "success",
            data: {
                data: doc
            }
        });
        
    }; 
}
