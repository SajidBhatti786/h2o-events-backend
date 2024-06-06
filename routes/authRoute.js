const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-otp", authController.verifyOTP);
router.post("/reset-password", authController.resetPassword);
router.get("/logout", authMiddleware.authenticationVerifier, authController.logout);

// router.get("/logout", authMiddleware.verifyToken, authController.logout);
module.exports = router;
