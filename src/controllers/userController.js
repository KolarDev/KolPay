const multer = require('multer');
const cloudinary = require('cloudinary');
const { uploadToCloudinary } = require('./../middlewares/cloudinary');
const User = require('./../models/userModel');
const { getAllAndQuery } = require('./../controllers/factoryHandler');
const AppError = require('./../utils/appError');

// Get User Profile details
const userProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({
      status: 'success',
      data: {
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        accountNumber: user.accountNumber,
        nationality: user.nationality,
        dob: user.dob,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed!',
      message: 'Error fetching user data !',
    });
    console.log(error);
  }
};

// Get User Account Balance
const getMyBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('User not found', 404));
    res.status(200).json({
      status: 'success',
      data: {
        balance: user.balance,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed!',
      message: 'Error fetching user balance !',
    });
  }
  console.log(error);
};

// Uploading user photo
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Update User Profile details
const upload = multer();
const updateProfile = async (req, res, next) => {
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
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed!',
      message: 'Error deleting user !',
    });
    console.log(error);
  }
};

// Perform all queries on users
const getAllUsers = getAllAndQuery(User);

module.exports = {
  userProfile,
  upload,
  updateProfile,
  deleteUser,
  getMyBalance,
  getAllUsers,
};
