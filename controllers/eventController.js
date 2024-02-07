const Event = require("../models/eventModel"); // Adjust the path accordingly
const Ticket = require("../models/ticketModel");
const User = require("../models/userModel");
const { uploadMultipleFiles } = require("../utils/fileUploadUtil");
// Controller to create a new event
const createEvent = async (req, res) => {
  try {
    // Assuming the user ID is decoded from the token and available in req.decoded
    const userId = req.decoded.id;

    // Extracting event information from the request body
    // Extracting non-file fields from the request body
    const { title, description, date, time, venue, totalSeats, ticketPrice } =
      req.body;
    if (
      !title ||
      !description ||
      !date ||
      !time ||
      !venue ||
      !ticketPrice ||
      !totalSeats
    ) {
      return res.status(400).json({
        status: 400,
        message: "All the fields are required",
      });
    }
    // Extracting images from the request files
    console.log(req.body);
    const images = req.files;
    // // Iterate over the array of image data and save references in the event's images array
    // for (const imageData of images) {
    //   // Assuming imageData is an object containing information about the image
    //   const newImage = new Image({
    //     url: imageData.url, // Store the Cloudinary URL or other reference
    //     description: imageData.description,
    //     // Add other image-related fields as needed
    //   });

    //   // Save the new image to the database
    //   const savedImage = await newImage.save();

    //   // Add the saved image reference to the event's images array
    //   newEvent.images.push(savedImage._id);
    // }
    const newImages = await uploadMultipleFiles(images);
    // console.log(newImages);
    const uploadingImages = [];
    for (img in newImages) {
      uploadingImages.push(newImages[img].imageUrl);
    }
    // Saving the new event to the database
    // Creating a new event object
    console.log(uploadingImages);
    const newEvent = new Event({
      title,
      description,
      images: uploadingImages,
      date,
      time,
      venue,
      totalSeats,
      availableSeats: totalSeats,
      ticketPrice,
      createdBy: userId,
    });
    const savedEvent = await newEvent.save();

    res
      .status(201)
      .json({ message: "Event created successfully", event: savedEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateEvent = async (req, res) => {
  console.log(updateEvent);
  try {
    const eventId = req.body.eventId;
    const userId = req.decoded.id;

    // Check if the event exists
    const existingEvent = await Event.findById(eventId);

    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the user updating the event is the same user who created it
    if (existingEvent.createdBy.toString() !== userId) {
      return res.status(403).json({
        message: "Unauthorized. You are not the creator of this event.",
      });
    }

    // Extract updated event information from the request body
    const { title, description, date, time, venue, totalSeats, ticketPrice } =
      req.body;
    let reservedSeats = existingEvent.totalSeats - existingEvent.availableSeats;
    if (reservedSeats > totalSeats) {
      return res.status(400).json({
        message:
          "Invalid request. The requested number of seats exceeds the reserved seats for the event.",
      });
    }
    // Update the existing event fields
    existingEvent.title = title;
    existingEvent.description = description;
    existingEvent.date = date;
    existingEvent.time = time;
    existingEvent.venue = venue;
    existingEvent.totalSeats = totalSeats;
    existingEvent.availableSeats = totalSeats - reservedSeats;
    existingEvent.ticketPrice = ticketPrice;

    // Save the updated event to the database
    const updatedEvent = await existingEvent.save();

    res.json({ message: "Event updated successfully", event: updatedEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const eventList = async (req, res) => {
  try {
    const userId = req.decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(user);
    if (user.role == "admin") {
      console.log("Admin");
      // If the user is an admin, fetch all events created by that admin
      const adminEvents = await Event.find({ createdBy: userId });

      return res.json(adminEvents);
    } else {
      console.log("User");
      // If the user is not an admin, fetch events for which the user has bought tickets
      const userTickets = await Ticket.find({ userId }).populate("eventId");

      // Extract events from user tickets
      const userEvents = userTickets.map((ticket) => ticket.eventId);

      return res.json(userEvents);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getSingleEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Check if the event ID is provided
    if (!eventId) {
      return res
        .status(400)
        .json({ message: "Event ID is required in the request body" });
    }

    // Check if the event exists
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = {
  createEvent,
  updateEvent,
  eventList,
  getSingleEvent,
};
