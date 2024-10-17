const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

// 1. Registration and login
router.post('/register', authController.register); // User Registration
router.post('/login', authController.login); // User Login

// 2. Password Management
router.post('/forgotPassword', authController.forgotPassword); // If user forgets his password
router.patch('/resetPassword/:token', authController.resetPassword); // Reset user password

router.patch('/updatePassword', authController.updatePassword); // Update User Password

// 3. Two Factor Authentication
router
  .route('/2faAuth')
  .get(authController.twoFaAuth)
  .post(authController.verify2FaToken);

// 4. User Profile routes
router.use(authController.protectRoute);

router
  .route('/profile')
  .get(userController.userProfile) // Get User Profile details
  .patch(userController.upload.single('photo'), userController.updateProfile) // Update User Profile details
  .delete(userController.deleteUser); // Delete User Account

// router.route("/transactions/id")
//     .get(userController.getMyTransactions);

router.route('/balance').get(userController.getMyBalance); // Get user account balance

module.exports = router;
