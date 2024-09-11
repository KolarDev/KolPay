const AppError = require("../utils/appError");
const Transaction = require("./../models/transactionModel");
const User = require("./../models/userModel");
const Email = require("./../utils/notificator");


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

exports.deposit = async (req, res, next) => {

    const { userId, transactionType, amount } = req.body;

    const transaction = await Transaction.create({ userId: req.user._id, transactionType: "deposit", amount });

    if (amount > 1000000) return next(new AppError("Can't deposit larger amounts!", 401));
    
    const user = await User.findOne({ _id: req.user._id });

    user.balance += amount;

    await user.save({ validateBeforeSave: false });

    await new Email(user).send(receipt(user, transaction), "Transaction Receipt");

    res.status(200).json({
        status: "success",
        message: "Transaction Successful👍",
        reciept: receipt(user, transaction)
    });

}

exports.withdrawal = async (req, res, next) => {

    const { userId, transactionType, amount } = req.body;

    const transaction = await Transaction.create({ userId: req.user.id, transactionType: "withdrawal", amount });

    const user = await User.findById(req.user.id);

    if (user.balance < amount) return next(new AppError("Insufficient Funds!", 401));

    user.balance -= amount;

    await user.save({ validateBeforeSave: false });

    await new Email(user).send(receipt(user, transaction), "Transaction Receipt");

    res.status(200).json({
        status: "success",
        message: "Transaction Successful👍",
        reciept: receipt(user, transaction)
    });

}

exports.transfer = async (req, res, next) => {

    const { amount, recepientAccNo } = req.body;

    const sender = await User.findById(req.user.id);
    const recepient = await User.findOne({ accountNumber: recepientAccNo });

    if (!recepient) return next(new AppError("No account found!", 400));
    if (sender.balance < amount) return next(new AppError("Insufficient fund!", 400));

    const transaction = await Transaction.create({ userId: req.user.id, transactionType: "transfer", amount });

    sender.balance -= amount;
    recepient.balance += amount;

    await sender.save({ validateBeforeSave: false }); 
    await recepient.save({ validateBeforeSave: false });

    await new Email(sender).send(receipt(sender, transaction), "Transaction Receipt");

    res.status(200).json({
        status: "success",
        message: "Transaction Successful👍",
        reciept: receipt(sender, transaction)
    });

}

