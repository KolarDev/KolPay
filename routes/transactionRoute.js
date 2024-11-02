const express = require("express");
const transactionController = require("./../controllers/transactionController");
const adminController = require("./../controllers/adminController");
const { protectRoute, adminAuth } = require('./../middlewares/authorize');

const router = express.Router();

// protect route for only loggedIn users
router.use(protectRoute); 

router.route("/deposit")
    .post(transactionController.deposit); // deposit funds to kolpay

router.route("/withdrawal")
    .post(transactionController.withdrawal); // withdraw funds from kolpay to kolpay

router.route("/transfer")
    .post(transactionController.transfer); // transfer funds from kolpay to kolpay

// Get user transaction history
router.get("/history", transactionController.transactionsHistory);


module.exports = router;