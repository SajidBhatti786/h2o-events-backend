const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const authMiddleware = require("../middleware/authMiddleware");
const ticketController = require("../controllers/ticketController");
router.post(
  "/buy-ticket/:eventId",
  authMiddleware.authenticationVerifier,
  ticketController.buyTicket
);
router.get(
  "/:eventId",
  authMiddleware.isAdminVerifier,
  ticketController.getUsersWithTicketsForEvent
);
router.get(
  '/:eventId/registrations',
  authMiddleware.authenticationVerifier,
  ticketController.getUsersWithTicketsForEvent
)

module.exports = router;
