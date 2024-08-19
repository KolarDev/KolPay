const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");


const router = express.Router();

// 1. Registration and login
router.post("/register", authController.register); // User Registration
router.post("/login", authController.login); // User Login
    
// 2. Password Management
router
    .route("/:id")
    .patch(authController.updatePassword) // Update User Password
    .patch(authController.forgotPassword) // If user forgets his password
    .patch(authController.resetPassword) // Reset user password 


router
    .route("/")
    .get(userController.getAllUsers); // Get all Users (Restricted to only admin)


// User Profile routes
router.use(authController.protectRoute);
router
    .route("/profile/:id")
    .get(userController.userProfile) // Get User Profile details
    .patch(userController.updateProfile) // Update User Profile details
    .delete(userController.deleteUser) // Delete User Account



module.exports = router;