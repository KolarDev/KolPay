const express = require("express");
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");
const transactionController = require("./../controllers/transactionController");
const adminController = require("./../controllers/adminController");
// const User = require("./../models/userModel");
// const Transaction = require("./../models/transactionModel");

const router = express.Router();

// Protect all routes to only logged in users and Give access to only admins
router.use(authController.protectRoute, adminController.adminAuth("admin", "Super-admin"));

// // Give access to only the admins
// router.use(adminController.adminAuth("admin"));

router
    .route("/dashboard")
    .get(adminController.dashboard); // View all activities stats

router
    .route("/users")
    .get(adminController.getAllUsers) // Retreive all users
    .delete(adminController.deleteUser); // Delete a user
    

router
    .route("/transactions")
    .get(adminController.getAllTransactions); // Retreive all transactions

router
    .route("/users/block/:id")
    .get(adminController.blockedUsers)
    .patch(adminController.block);
// router
//     .route("/reports")
//     .get(adminController.dashboard);

router
    .route("/logs")
    .get(adminController.getAllLogs);





module.exports = router;
