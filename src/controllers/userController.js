const multer = require('multer');
const cloudinary = require('cloudinary');
const { uploadToCloudinary } = require('./../middlewares/cloudinary');
const User = require('./../models/userModel');
const { getAllAndQuery } = require('./../controllers/factoryHandler');
const AppError = require('./../utils/appError');

// Get User Profile details
exports.userProfile = async (req, res, next) => {
  const user = await User.findOne(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
};

// Uploading user photo
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Update User Profile details
exports.upload = multer();
exports.updateProfile = async (req, res, next) => {
  // 1. Check if the user is not trying to update the password
  if (req.body.password || req.body.passwordConfirm) {
    return new AppError('This route is not for password update!', 400);
  }

  console.log(req.file);

  // Upload user photo to the cloud and save the url in the database
  if (req.file) {
    console.log(req.file);

    const file = req.file.buffer;
    const folder = 'KolPay-UserPhoto';
    try {
      // Upload to Cloudinary
      const { uploadResult } = await uploadToCloudinary(file, folder);
      const photoUrl = uploadResult.secure_url;
      // The url of the uploaded photo be stored as photo
      req.body.photo = photoUrl;
    } catch (error) {
      return next(new AppError('Error uploading photo to Cloudinary!', 500));
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) next(new AppError('User not found!', 404));

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
};

// Delete User Account
exports.deleteUser = async (req, res, next) => {
  const user = await User.findOne();
};

// Get User Account Balance

exports.getMyBalance = async (req, res) => {
  const user = await User.findById(req.user);

  res.status(200).json({
    status: 'success',
    data: {
      balance: user.balance,
    },
  });
};

// Perform all queries on users
exports.getAllUsers = getAllAndQuery(User);