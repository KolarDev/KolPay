const { promisify } = require('util');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');

const protectRoute = async (req, res, next) => {
  // 1. Get the token from the authorization header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check if there is no token. which means the user is not logged in
  if (!token) return next(new AppError('Please login to get access!', 401));

  // 2. Verifying the token. Server verifies by test signature
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check if user still exists
  const confirmUser = await User.findById(decoded.id);
  if (!confirmUser) {
    return next(
      new AppError('Authentication Failed!, Try logging in again', 401),
    );
  }

  // 4. Save the confirm user in as req.user for use in the protected route.
  req.user = confirmUser;
  res.locals.user = confirmUser;
  // Road clear!! Move on...
  next();
};

// Middleware to restrict action based on roles
const adminAuth = (...roles) => {
  return (req, res, next) => {
    console.log(req.user);
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access Denied !', 403));
    }
    next();
  };
};

module.exports = {
  protectRoute,
  adminAuth,
};
