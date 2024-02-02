const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const authMiddleware = require("../middleware/authMiddleware");
const ticketController = require("../controllers/ticketController");
router.post(
  "/buy-ticket",
  authMiddleware.authenticationVerifier,
  ticketController.buyTicket
);
module.exports = router;
