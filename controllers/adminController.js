const Transaction = require("./../models/transactionModel");
const User = require("./../models/userModel");
const AuditLog = require("./../models/auditLogModel");
const AppError = require("../utils/appError");
const { Email, sms } = require("./../utils/notificator");
const APIqueries = require("../utils/APIqueries");


// Function to simplify logging in each admin operation
const auditLogger = async (adminId, action, details) => {
    const log = new AuditLog({ adminId, action, details });
    await log.save();
}

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


// Get the list of top Accounts/Users with their total transactions amount
exports.TopAccounts = (req, res, next) => {
    req.query.limit = "5",
    req.query.sort = "balance",
    req.query.fields = "fullname,username,email,accountNumber,phone"
    next(); 
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

        await auditLogger(req.user.id, "Viewed Dashboard", "viewed the dashboard");

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


// General query function. This function can perform any query from any database collection
const getAllAndQuery = (Model) => {
    async (req, res, next) => {
        try {

            const features = new APIqueries(Model.find(), req.query)
                .filter()
                .sort()
                .limitFields()
                .paginate();
            const doc = await features.query;

            if (!doc) return next(new AppError("No document found !", 404));
    
            await auditLogger(req.user.id, "queried for a data", `queried for ${Model}`);
    
            // RESPONSE
            res.status(200).json({
                status: "success",
                result: doc.length,
                data: {
                    data: doc
                }
            });
        
        
        } catch (error) {
            res.status(500).json({
                status: "failed !",
                message: `Failed to retrieve ${Model} !`,
                error
            });
        }
    }
}

// Perform all queries on users
exports.getAllUsers = getAllAndQuery(User);
// Perform all queries on transactions
exports.getAllTransactions = getAllAndQuery(Transaction);

// Admins can update a user's role, isBlocked & active status
exports.updateUser = async (req, res, next) => {
    
    const { active, role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!user) return next(new AppError("User not found !", 404));

    await auditLogger(req.user.id, " ", " ");

    res.status(201).json({
        status: "success",
        data: {
            data: user
        }
    });
}

// Admin blocking and unblocking of users functionality
exports.block = async (req, res, next) => {
    try {
        
        const user = User.findById(req.params.id).populate();

        if (!user) return next(new AppError("User not found !", 404));

        // Deny access if an admin tries to block fellow admin. Only the super-admin is allowed
        if (!(req.user.role.includes("Super-admin"))) {
            return next(new AppError("You are not allowed to block fellow admin !", 401));
        }

        user.isBlocked = !user.isBlocked;
        await user.save;

        await auditLogger(
            req.user.id,
           ` ${ "Blocked" ? user.isBlocked === true : "Unblocked" } user ${user.fullname} with id ${user.id}`,
            `${req.user.fullname} just blocked/unblocked a user`
        );

        res.status(201).json({
            status: "success",
            data: {
                data: user
            }
        });

    } catch (error) {
        res.status(500).json({
            status: "failed !",
            message: `Failed to block/unblock user !`,
            error
        });
    }
}

// Admin can retrieve blocked users
exports.blockedUsers = async (req, res, next) => {
    try {
        const users = await User.find({ isBlocked: { $ne: false } }).select("-password");

        if (!users) next(new AppError("No blocked user!", 404));

        await auditLogger(req.user.id, "queried for all blocked users", "queried for all blocked users");

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

// Admin can temporarily delete a user by setting the active field to false 
exports.deleteUser = async (req, res, next) => {
    try {
        const user = User.findById(req.params.id);
        if (!user) return next(new AppError("User not found !", 404));

        // Deny access if an admin tries to delete fellow admin. Only the super-admin is allowed
        if (!(req.user.role.includes("Super-admin"))) {
            return next(new AppError("You are not allowed to delete fellow admin !", 401));
        }

        user.active = false;
        await user.save;

        await auditLogger(
            req.user.id,
            "deleted a user",
            `deleted user ${user.fullname} with id ${user.id} temporarily from accessing his account and from the list of active users`
        );

        res.status(200).json({
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


// Get all audit logs (route would be restricted to only Super-admins)
exports.getAllLogs = async (req, res, next) => {
    try {
        const logs = await AuditLog.find();

        res.status(200).json({
            status: "success",
            data: {
                logs
            }
        });

    } catch (error) {
        res.status(500).json({
            status: "failed !",
            message: "Failed to retrieve logs !",
            error
        });
    }
}














// Generate Transaction Report
const generateTransactionReport = async (req, res) => {
    try {
      const transactions = await Transaction.find().populate('userId', 'username email');
      const csvData = transactions.map(tx => ({
        user: `${tx.userId.username} (${tx.userId.email})`,
        type: tx.type,
        amount: tx.amount,
        date: tx.date.toLocaleString(),
        balanceAfter: tx.balanceAfter
      }));
  
      res.status(200).json(csvData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate report', error });
    }
};
  



//                        -------Alternatives to make GET Requests--------

// // Get all users
// exports.getAllUsers = async (req, res, next) => {
//     try {
//         const users = await User.find().select("-password");

//         if (!users) next(new AppError("Users not found!", 404));

//         await auditLogger(req.user.id, "viewed list of all users", "viewed list of all users");

//         res.status(200).json({
//             status: "success",
//             result: users.length,
//             data: {
//                 users
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: "failed !",
//             message: "Failed to retrieve users !",
//             error
//         });
//     }
// }

// // Get all transactions
// exports.getAllTransactions = async (req, res, next) => {

//     try {
//         const transactions = await Transaction.find().populate("_id", "email");

//         if (!transactions) next(new AppError("Transactions not found!", 404));

//         await auditLogger(req.user.id, "List of all transactions", "List of all transactions");

//         res.status(200).json({
//             status: "success",
//             result: transactions.length,
//             data: {
//                 transactions
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: "failed !",
//             message: "Failed to retrieve transactions !",
//             error
//         });
//     }
// }
