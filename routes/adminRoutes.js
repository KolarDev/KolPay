const express = require("express");
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");
const transactionController = require("./../controllers/transactionController");
const adminController = require("./../controllers/adminController");
const User = require("./../models/userModel");
const Transaction = require("./../models/transactionModel");

const router = express.Router();

// Protect all routes to only logged in users
router.use(authController.protectRoute);

// Give access to only the admins
router.use(adminController.adminAuth("admin"));

router
    .route("/dashboard")
    .get(adminController.dashboard);

router
    .route("/users")
    .get(adminController.getAllUsers)
    .get(adminController.getBy(User));

router
    .route("/transactions")
    .get(adminController.getAllTransactions)
    .get(adminController.getBy(Transaction));

// router
//     .route("/reports")
//     .get(adminController.dashboard);

// router
//     .route("/logs")
//     .get(adminController.getAllLogs);





module.exports = router;
