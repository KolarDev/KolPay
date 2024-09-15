const User = require("./../models/userModel");
const AppError = require("./../utils/appError");



// Get User Profile details
exports.userProfile = async(req, res, next) => {
    const user = await User.findOne(req.user.id);

    res.status(200).json({
        status: "success",
        data: {
            user
        }
    });
}

// Update User Profile details
exports.updateProfile = async(req, res, next) => {
    const user = await User.findOneAndUpdate(req.user.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!user) next(new AppError("User not found!", 404));

    res.status(200).json({
        status: "success",
        data: {
            user
        }
    });
}

// Delete User Account
exports.deleteUser = async(req, res, next) => {
    const user = await User.findOne();
}


// Get User Account Balance

exports.getMyBalance = async (req, res) => {
    const user = await User.findById(req.user);

    res.status(200).json({
        status: "success",
        data: {
            balance: user.balance
        }
    });
}
