const express = require("express");
const authController = require("./../controllers/authController");
const transactionController = require("./../controllers/transactionController");
const adminController = require("./../controllers/adminController");

const router = express.Router();

// protect route for only loggedIn users
router.use(authController.protectRoute); 

router.route("/deposit")
    .post(transactionController.deposit); // deposit funds to kolpay

router.route("/withdrawal")
    .post(transactionController.withdrawal); // withdraw funds from kolpay to kolpay

router.route("/transfer")
    .post(transactionController.transfer); // transfer funds from kolpay to kolpay 





module.exports = router;