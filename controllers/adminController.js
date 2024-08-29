const Transaction = require("./../models/transactionModel");
const User = require("./../models/userModel");
const AppError = require("../utils/appError");
const Email = require("./../utils/email");


exports.adminAuth = (req, res, next) => {
    if (req.user && req.user.role === "admin") return next();

    res.status(403).json({
        status: "failed !",
        message: "Access denied !",
        data: null
    });
}

exports.dashboard = async (req, res, next) => {

    try {
        totalUsers = await User.countDocuments();
        totalTransactions = await Transaction.countDocuments(); 

        const users_stats = await User.aggregate([
            {
                $group: {
                    _id: null,
                    numUsers: { $sum: 1 },
                    total_balance: { $sum: "$balance"}
        
                }
            
            }
        
        ]);

        const transaction_stats = await Transaction.aggregate([
            {
                $group: {
                    _id: null,
                    numTransactions: { $sum: 1 },
                    totalTransactionsAmount: { $sum: "$amount"}
                }
            
            }
        
        ]);

        res.status(200).json({
            status: "success",
            totalUsers,
            totalTransactions,
            users_stats,
            transaction_stats
        });

    } catch (error) {
        res.status(500).json({
            status: "failed !",
            message: "Error loading dashboard data !",
            error
        });
   }

}  