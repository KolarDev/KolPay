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
    try {
        const users = await User.find().select("-password");

        if (!users) next(new AppError("Users not found!", 404));

        res.status(200).json({
            status: "success",
            result: users.length,
            data: {
                users
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "failed !",
            message: "Failed to retrieve users !",
            error
        });
    }
}

exports.getAllTransactions = async (req, res, next) => {

    try {
        const transactions = await Transaction.find().populate("_id", "email");

        if (!transactions) next(new AppError("Transactions not found!", 404));2

        res.status(200).json({
            status: "success",
            result: transactions.length,
            data: {
                transactions
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "failed !",
            message: "Failed to retrieve transactions !",
            error
        });
    }
}

// Filter Transaction by type/id/
exports.getTransactionBy = async (req, res, next) => {
    try {
        const { type, userId, startDate, endDate } = req.query;
        let filter = {};
        if (type) filter.transactionType = type;
        if (userId) filter.userId = userId;
        if (startDate && endDate) filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        const transactions = await Transaction.find(filter);

        if (!transactions) next(new AppError("No match trasaction!", 404));

        res.status(200).json({
            status: "success",
            result: transactions.length,
            data: {
                transactions
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "failed !",
            message: "Failed to retrieve transactions !",
            error
        });
    }
}

// exports.getBy = model =>
//     async (req, res, next) => {
//         // To allow for nested GET reviews (hack)
//         let filter = {};
//         if (req.params.id) filter = { model: req.params.id };

//         const features = new APIqueries(model.find(filter), req.query)
//             .filter()
//             .sort()
//             .limitFields()
//             .paginate();
//         const doc = await features.query;

//         // RESPONSE
//         res.status(200).json({
//             status: "success",
//             result: doc.length,
//             data: {
//                 data: doc
//             }
//         });
    
//     }

// Admins can update a user's role, isBlocked & active status
exports.updateUser = async (req, res, next) => {
    
    const { active, isBlocked, role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!user) return next(new AppError("User not found !", 404));

    res.status(201).json({
        status: "success",
        data: {
            data: user
        }
    });
}

// Admin blocking of users functionality
exports.block = async (req, res, next) => {
    try {
        
        const user = User.findById(req.params.id);

        if (!user) return next(new AppError("User not found !", 404));

        user.isBlocked = !user.isBlocked;
        await user.save;

        res.status(201).json({
            status: "success",
            data: {
                data: user
            }
        });

    } catch (error) {
        res.status(500).json({
            status: "failed !",
            message: "Failed to block/unblock user !",
            error
        });
    }
}

// Admin can retrieve blocked users
exports.blockedUsers = async (req, res, next) => {
    try {
        const users = await User.find({ isBlocked: { $ne: false } }).select("-password");

        if (!users) next(new AppError("No blocked user!", 404));

        res.status(200).json({
            status: "success",
            result: users.length,
            data: {
                users
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "failed !",
            message: "Failed to retrieve users !",
            error
        });
    }
}

// Admin can temporarily delete a user be setting the active field to false
exports.deleteUser = async (req, res, next) => {
    try {

        const user = User.findById(req.params.id);
        if (!user) return next(new AppError("User not found !", 404));

        user.active = false;
        await user.save;

        res.status(201).json({
            status: "success",
            data: {
                data: user
            }
        });

    } catch (error) {
        res.status(500).json({
            status: "failed !",
            message: "Failed to delete user !",
            error
        });
    }
}
