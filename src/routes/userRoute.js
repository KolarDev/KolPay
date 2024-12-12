const express = require('express');
const {
  userProfile,
  upload,
  updateProfile,
  deleteUser,
  getMyBalance,
  getAllUsers,
} = require('./../controllers/userController');
const {
  register,
  login,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  updatePassword,
  twoFaAuth,
  verify2FaToken,
} = require('./../controllers/authController');
const { protectRoute, adminAuth } = require('./../middlewares/authorize');
const {
  createInvoice,
  getMyInvoices,
  deleteInvoice,
} = require('./../controllers/invoiceController');
const {
  addVirtualCard,
  myVirtualCard,
  editCardDetails,
  deleteCardDetails,
} = require('./../controllers/virtualCardController');

const router = express.Router();

// 1. Registration and login
router.post('/register', register); // User Registration
router.post('/login', login); // User Login

// 2. Password Management
router.post('/forgot-password', forgotPassword); // If user forgets his password
router.patch('/:token/reset-password', resetPassword); // Reset user password

// ---Protected User Routes---
router.use(protectRoute);

router.patch('/updatePassword', updatePassword); // Update User Password

// 3. Two Factor Authentication
router.route('/two-faauth').patch(twoFaAuth).post(verify2FaToken);

// 4. User Profile routes
router.route('/send-otp').patch(sendOtp).post(verifyOtp);

router
  .route('/profile')
  .get(userProfile) // Get User Profile details
  .patch(upload.single('photo'), updateProfile) // Update User Profile details
  .delete(deleteUser); // Delete User Account

router.route('/balance').get(getMyBalance); // Get user account balance

// Routes to manage an Invoice
router.post('/new-invoice', createInvoice);
router.get('/my-invoices', getMyInvoices);
router.delete('/invoices', deleteInvoice);

// Managing user virtual card details
router
  .route('/virtual-cards')
  .post(addVirtualCard)
  .patch(editCardDetails)
  .get(myVirtualCard)
  .delete(deleteCardDetails);

// Restrict below routes to only admins
router.use(adminAuth('admin', 'Super-admin'));

module.exports = router;
