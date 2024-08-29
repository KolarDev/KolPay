const express = require("express");
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");
const transactionController = require("./../controllers/transactionController");
const adminController = require("./../controllers/adminController");

const router = express.Router();

router.use(adminController.adminAuth);

router
    .route("/dashboard")
    .get(adminController.dashboard);

router
    .route("/users")
    .get(adminController.getAllUsers);

router
    .route("/users/:id")
    .get(adminController.dashboard);

router
    .route("/transactions")
    .get(adminController.getAllTransactions);

router
    .route("/reports")
    .get(adminController.dashboard);

router
    .route("/logs")
    .get(adminController.getAllLogs);





module.exports = router;
