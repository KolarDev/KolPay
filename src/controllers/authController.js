const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const bcrypt = require('bcryptjs');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const jwt = require('jsonwebtoken');
const Email = require('./../utils/notificator');
const { genAccNo, generateOtp } = require('../utils/generator');

// Registering user account
const register = async (req, res, next) => {
  try {
    const { fullname, username, email, phone, password, passwordConfirm } =
      req.body;

    const accountNumber = await genAccNo(User, phone);

    const newUser = await User.create({
      fullname,
      username,
      email,
      phone,
      accountNumber,
      password,
      passwordConfirm,
    });

    console.log(newUser);

    sendToken(newUser, 201, res); // Send token to login

    // confirmUrl = `${req.protocol}://${req.get('host')}/api/v1/user/verifyAccount/:${otp}`;

    // await new Email(newUser, confirmUrl).sendWelcome(); // Send welcome email including otp
  } catch (error) {
    res.status(500).json({
      status: 'failed !',
      message: 'Error creating your account !',
    });
    console.log(error);
  }
};

// Logging user in
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(new AppError('Provide your username and password!!', 401));
    }

    const user = await User.findOne({ username }).select('+password');

    if (!user || !(await user.checkPassword(password, user.password))) {
      return next(new AppError('Invalid Credentials!!', 401));
    }

    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      status: 'failed !',
      message: 'Error logging in !',
    });
    console.log(error);
  }
};

const sendOtp = async (req, res, next) => {
  try {
    const userId = req.user._id;
    // generate OTP for user and save to the database
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 12); //Hash the Otp
    const otpExpiresIn = Date.now() + 60 * 60 * 1000; // 1 hour
    const user = User.findByIdAndUpdate(
      { _id: userId },
      { otp: hashedOtp, otpExpires: otpExpiresIn },
      { validateBeforeSave: true, upsert: true },
    );

    if (!user) return next(new AppError('User not found!', 404));

    await new Email(user).sendOtp();
  } catch (error) {
    res.status(500).json({
      status: 'success',
      message: 'Error sending otp !',
    });
    console.log(error);
  }
};

// Verify User Account
const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) return next(new AppError('User not found!', 404));

  const verifyOtp = await bcrypt.compare(otp, user.otp);
  if (!verifyOtp) return next(new AppError('Invalid'));

  // Update neccessary fields
  user.isVerified == true;
  user.otp == undefined;
  user.otpExpires == undefined;
  await user.save({ validateBeforeSave: true });

  res.status(200).json({
    status: 'success',
    message: 'Account Verification Successful !',
  });
};

// Forgot Password Functionality
const forgotPassword = async (req, res, next) => {
  try {
    // Get user based on valid email
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('No user with this email !', 404));
    }

    // Generate random password reset token
    const resetToken = user.genPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send it to the user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/${resetToken}/reset-password`;

    const message = `Forgot your Password ? Click the button below to reset your password
    ${resetURL} \n Ignore this email If you didn't request for this. (Expires in 10mins)`;

    console.log(resetURL);

    res.status(200).json({
      status: 'success',
      message: 'Reset Password link sent to your email',
    });
  } catch (error) {
    res.status(500).json({
      status: 'failed !',
      message: 'Error processing your request !',
    });
    console.log(error);
  }
};

// Reset Password Functionality after forgot password
const resetPassword = async (req, res, next) => {
  try {
    // 1. Get the user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2. If token has not expired and there is user, Set the new password
    if (!user) {
      return next(new AppError('Invalid or Expired Token, Try again!', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // 3. Update changedPasswordAt property for the user
    // 4. Log the user in, send jwt
    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      status: 'failed !',
      message: 'Error processing your request !',
    });
    console.log(error);
  }
};

// Password Update Functionality. Logged in users changing password
const updatePassword = async (req, res, next) => {
  // 1. Get the logged in user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2. Check if the user's current password is correct
  if (!(await user.checkPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Incorrect Current Password!', 401));
  }

  // 3. If current password is correct, Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4. Log the user in. Send jwt
  sendToken(user, 200, res);
};

//                                TWO FACTOR AUTHENTICATION (2FA)

// 1. Generating secret for Authenticator App
const twoFaAuth = async (req, res, next) => {
  try {
    const secret = speakeasy.generateSecret({ name: 'KolPayApp' });

    const qrCode = await qrcode.toDataURL(
      secret.otpauth_url,
      (err, data_url) => {
        if (err) throw err;
        return data_url;
      },
    );

    // Get the user
    const user = req.user;
    if (!user) return next(new AppError('You need to login first !', 401));
    // update the user secretBase32 to be used to verify user
    user.secretBase32 = secret;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: {
        secret,
        qrCode,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'failed !',
      message: 'Error generating secret code or qrcode !',
    });
    console.log(error);
  }
};

// 2. Verifying the token from Authenticator App
const verify2FaToken = (req, res, next) => {
  try {
    const { userInputToken } = req.body;

    const verified = speakeasy.totp.verify({
      secret: req.user.secretBase32,
      encoding: 'base32',
      token: userInputToken,
    });
    if (!verified) return next(new AppError('Invalid token', 401));

    res.status(200).json({
      status: 'success',
      message: 'Token is valid',
    });
  } catch (error) {
    res.status(500).json({
      status: 'failed !',
      message: 'Error verifying the token !',
    });
    console.log(error);
  }

  next();
};

// Authenticating using OTP via email or phone

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  // console.log(token);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  updatePassword,
  twoFaAuth,
  verify2FaToken,
};
