const Ticket = require("../models/ticketModel"); // Adjust the path accordingly
const Event = require("../models/eventModel"); // Adjust the path accordingly

// Controller to handle ticket purchase
const buyTicket = async (req, res) => {
  try {
    // Extracting user ID from the decoded token
    const userId = req.decoded.id;

    // Extracting event information from the request body
    const { eventId } = req.body;

    // Check if the event exists
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the event has available seats
    // Add additional validation logic as needed
    if (event.availableSeats <= 0) {
      return res
        .status(400)
        .json({ message: "No available seats for the event" });
    }
    // Check if the user has already purchased a ticket for the event
    const existingTicket = await Ticket.findOne({ userId, eventId });

    if (existingTicket) {
      return res.status(400).json({
        message: "User has already purchased a ticket for this event",
      });
    }
    // Create a new ticket
    const newTicket = new Ticket({
      userId,
      eventId,

      // Add other ticket-related fields as needed
    });

    // Save the new ticket to the database
    const savedTicket = await newTicket.save();

    // Update the available seats for the event
    await Event.findByIdAndUpdate(eventId, {
      $inc: { availableSeats: -1 }, // Decrease available seats by 1
    });

    res
      .status(201)
      .json({ message: "Ticket purchased successfully", ticket: savedTicket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  buyTicket,
};
