const AppError = require("../utils/appError");
const Transaction = require("./../models/transactionModel");
const User = require("./../models/userModel");


exports.deposit = async (req, res, next) => {

    const { amount } = req.body;

    const transaction = await Transaction.create({ id: req.user.id, type: "deposit", amount });
    
    const user = await User.findOne(req.user.id);

    user.balance += amount;

    await user.save();

    res.status(200).json({
        status: "success",
        message: "Transaction Successful👍",
        data: {

        }
    });

    next();
}

exports.withdrawal = async (req, res, next) => {

    const { amount } = req.body;

    const transaction = await Transaction.create({ id: req.user.id, type: "withdrawal", amount });

    if (user.balance < amount) return next(new AppError("Insufficient Funds!", 401));
    
    const user = await User.findById(req.user.id);

    user.balance -= amount;

    next();
}

exports.transfer = async (req, res, next) => {

    const { amount, recepientAccNo } = req.body;

    const sender = await User.findById(req.user.id);
    const recepient = await User.findOne({ accountNumber: recepientAccNo });

    if (!recepient) return next(new AppError("No account found!", 400));
    if (sender.balance < amount) return next(new AppError("Insufficient fund!", 400));

    const transaction = await Transaction.create({ id: req.user.id, type: "transfer", amount });

    sender.balance -= amount;
    recepient.balance += amount;
    await sender.save();
    await recepient.save();

    res.status(200).json({
        status: "success",
        amount: amount,
        message: "Transaction Successful!",
        data: {
            transaction
        }
    });
    
    next();
}