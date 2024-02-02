const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

// Endpoint to get data of a single user
router.get(
  "/:userId",
  authMiddleware.authenticationVerifier,
  userController.getSingleUser
);

module.exports = router;
