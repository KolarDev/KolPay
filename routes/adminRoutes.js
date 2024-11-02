const express = require('express');
const adminController = require('./../controllers/adminController');
const { getAllUsers } = require('./../controllers/userController');
const {
  getAllTransactions,
} = require('./../controllers/transactionController');
const { protectRoute, adminAuth } = require('./../middlewares/authorize');

const router = express.Router();

// Protect all routes to only logged in users and Give access to only admins
router.use(protectRoute, adminAuth('admin', 'Super-admin'));

// // Give access to only the admins
// router.use(adminController.adminAuth("admin"));

router.route('/dashboard').get(adminController.dashboard); // View all activities stats

router
  .route('/get-users')
  .get(getAllUsers) // Retreive all users
  .delete(adminController.deleteUser); // Delete a user

router.route('/get-transactions').get(getAllTransactions); // Retreive all transactions

// Block a user
router.patch('/:id/block', adminController.block);
// View all blocked users
router.get('/blocked', adminController.blockedUsers);

router.route('/logs').get(adminController.getAllLogs);

module.exports = router;
