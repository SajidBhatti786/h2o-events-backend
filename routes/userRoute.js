const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");
const { uploadSingleMiddleware } = require("../utils/fileUploadUtil");

// Endpoint to get data of a single user
router.get(
  "/:userId",
  authMiddleware.authenticationVerifier,
  userController.getSingleUser
);
router.post(
  "/change-profile",
  uploadSingleMiddleware,
  authMiddleware.authenticationVerifier,
  userController.changeProfileImage
);
module.exports = router;
