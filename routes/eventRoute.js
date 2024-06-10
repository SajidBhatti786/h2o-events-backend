const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const authMiddleware = require("../middleware/authMiddleware");
const eventController = require("../controllers/eventController");
const { uploadMultipleMiddleware } = require("../utils/fileUploadUtil");
router.post(
  "/create-event",
  uploadMultipleMiddleware,
  authMiddleware.isAdminVerifier,

  eventController.createEvent
);

//all Events by admin
router.get(
  "/event-list",
  authMiddleware.authenticationVerifier,
  eventController.eventList
);


//all events to show to the user
router.get(
  "/get-all-events",
  authMiddleware.authenticationVerifier,
  eventController.getAllEvents
  
  )

//booked events by user
router.get(
  "/booked-events",
  authMiddleware.authenticationVerifier,
  eventController.bookedEvents
)
router.put(
  "/update-event",
  uploadMultipleMiddleware,
  authMiddleware.isAdminVerifier,
  eventController.updateEvent
);
router.get(
  "/:eventId",
  authMiddleware.authenticationVerifier,
  eventController.getSingleEvent
);
router.delete(
  "/delete-image",
  authMiddleware.isAdminVerifier,
  eventController.deleteEventImage
);



module.exports = router;
