const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const authMiddleware = require("../middleware/authMiddleware");
const eventController = require("../controllers/eventController");
router.post(
  "/create-event",
  authMiddleware.isAdminVerifier,
  eventController.createEvent
);
router.get(
  "/event-list",
  authMiddleware.authenticationVerifier,
  eventController.eventList
);
router.put(
  "/update-event",
  authMiddleware.isAdminVerifier,
  eventController.updateEvent
);
router.get(
  "/:eventId",
  authMiddleware.authenticationVerifier,
  eventController.getSingleEvent
);

module.exports = router;
