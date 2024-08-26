const express = require("express");
const authController = require("./../controllers/authController");
const transactionController = require("./../controllers/transactionController");



const router = express.Router();

router.use(authController.protectRoute);

router.route("/deposit")
    .post(transactionController.deposit);

router.route("/withdrawal")
    .post(transactionController.withdrawal);

router.route("/transfer")
    .post(transactionController.transfer);



module.exports = router;