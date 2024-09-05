const Transaction = require("./../models/transactionModel");
const User = require("./../models/userModel");
const AppError = require("../utils/appError");
const Email = require("./../utils/email");
const APIqueries = require("../utils/APIqueries");

// Middleware to restrict action based on roles
exports.adminAuth = (...roles) => {
   
    return (req, res, next) => {
        console.log(req.user);
        if (!roles.includes(req.user.role)) {
            return next(new AppError("Access Denied !", 403));
        }
        next();
    }
}

// The admin dashboard to monitor/view the Users and Transactions statistics
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


exports.getAllUsers = async (req, res, next) => {

    const users = await User.find();

    if (!users) next(new AppError("Users not found!", 404));

    res.status(200).json({
        status: "success",
        result: users.length,
        data: {
            users
        }
    });
}

exports.getAllTransactions = async (req, res, next) => {

    const transactions = await Transaction.find();

    if (!transactions) next(new AppError("Transactions not found!", 404));

    res.status(200).json({
        status: "success",
        result: transactions.length,
        data: {
            transactions
        }
    });
}




exports.getBy = model =>
    async (req, res, next) => {
        // To allow for nested GET reviews (hack)
        let filter = {};
        if (req.params.id) filter = { tour: req.params.id };////////////

        const features = new APIqueries(model.find(filter), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        // const doc = await features.query.explain();
        const doc = await features.query;

        // RESPONSE
        res.status(200).json({
            status: "success",
            result: doc.length,
            data: {
                data: doc
            }
        });
    
    }


exports.updateUser = async (req, res, next) => {
    
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!user) {
        return next(new AppError("User not found !", 404));
    }

    res.status(201).json({
        status: "Updated",
        data: {
            data: user
        }
    });
}