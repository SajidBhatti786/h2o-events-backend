const Ticket = require("../models/ticketModel"); // Adjust the path accordingly
const Event = require("../models/eventModel"); // Adjust the path accordingly
const User = require("../models/userModel"); // Adjust the path accordingly
// Controller to handle ticket purchase
// const buyTicket = async (req, res) => {
//   try {
//     // Extracting user ID from the decoded token
//     const userId = req.decoded.id;

//     // Extracting event information from the request body
//     const { eventId } = req.params;
//     console.log(eventId);
//     // Check if the event exists
//     const event = await Event.findById(eventId).exec();
//     console.log(event)

//     if (!event) {
//       return res.status(404).json({ message: "Event not found" });
//     }

//     // Check if the event has available seats
//     // Add additional validation logic as needed
//     if (event.availableSeats <= 0) {
//       return res
//         .status(400)
//         .json({ message: "No available seats for the event" });
//     }
//     // Check if the user has already purchased a ticket for the event
//     const existingTicket = await Ticket.findOne({ userId, eventId });

//     if (existingTicket) {
//       return res.status(400).json({
//         message: "User has already purchased a ticket for this event",
//       });
//     }
//     // Create a new ticket
//     const newTicket = new Ticket({
//       userId,
//       eventId,

//       // Add other ticket-related fields as needed
//     });

//     // Save the new ticket to the database
//     const savedTicket = await newTicket.save();

//     // Update the available seats for the event
//     await Event.findByIdAndUpdate(eventId, {
//       $inc: { availableSeats: -1 }, // Decrease available seats by 1
//     });

//     res
//       .status(201)
//       .json({ message: "Ticket purchased successfully", ticket: savedTicket });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  REFRESH_TOKEN,
  USER_EMAIL,
} = process.env;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const createEventLink = (event) => {
  const startTime = new Date(event.start.dateTime).toISOString();
  const endTime = new Date(event.end.dateTime).toISOString();
  const eventDetails = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.summary)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${startTime}/${endTime}`;
  return eventDetails;
};

const buyTicket = async (req, res) => {
  try {
    const userId = req.decoded.id;
    const { eventId } = req.params;

    const user = await User.findById(userId).exec();

    const event = await Event.findById(eventId).exec();

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.availableSeats <= 0) {
      return res.status(400).json({ message: "No available seats for the event" });
    }

    const existingTicket = await Ticket.findOne({ userId, eventId });

    if (existingTicket) {
      return res.status(400).json({ message: "User has already purchased a ticket for this event" });
    }

    const newTicket = new Ticket({ userId, eventId });
    const savedTicket = await newTicket.save();
    await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: -1 } });

    // Generate event link
    const eventLink = createEventLink({
      summary: event.title,
      location: event.venue,
      description: event.description,
      start: { dateTime: event.date },
      end: { dateTime: new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000) } // Assuming event duration of 2 hours
    });

    // Set up Nodemailer transporter
    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: USER_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: `H2OEvents <${USER_EMAIL}>`,
      to:  user.email,               //'sbhattti1212@gmail.com', // Replace with the user's email
      subject: 'Your Event Ticket and Details',
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="background-color: #f7f7f7; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://h2o-ent.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.c8bca4f1.png&w=640&q=75" alt="H2OEvents Logo" style="max-width: 150px;">
            <div style="color: black; font-size: 24px; margin-top: 10px;">H2O Events</div>
          </div>
          <h1 style="background-color: #000000; color: white; padding: 10px; border-radius: 8px;">${event.title}</h1>
          <p style="font-size: 16px;">We are excited to have you at our event. Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Date:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${event.date}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Time:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${new Date(event.date).toLocaleTimeString()}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Location:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${event.venue}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Description:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${event.description}</td>
            </tr>
          </table>
          <p style="text-align: center; margin-top: 20px;">
            <a href="${eventLink}" style="display: inline-block; padding: 10px 20px; background-color: #000000; color: white; text-decoration: none; border-radius: 8px;">Add to Google Calendar</a>
          </p>
        </div>
      </div>
    `,
  
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Ticket purchased successfully", ticket: savedTicket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUsersWithTicketsForEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    console.log(eventId);
    // Find the event by eventId
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Find tickets for the event
    const tickets = await Ticket.find({ eventId: eventId });
    console.log(tickets);
    // Extract user information from the tickets
    const usersData = [];
    for (const ticket of tickets) {
      const user = await User.findById(ticket.userId);
      const { full_name, profileImage, email, phone_number } = user;
      const newUser = { full_name, profileImage, email, phone_number };
      usersData.push(newUser);
    }
    // const usersWithTickets = tickets.map((ticket) => {
    //   return {
    //     userId: ticket.user._id,
    //     fullName: ticket.user.full_name,
    //     email: ticket.user.email,
    //     // Add more user details as needed
    //   };
    // });

    res.status(200).json(usersData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  buyTicket,
  getUsersWithTicketsForEvent,
};
