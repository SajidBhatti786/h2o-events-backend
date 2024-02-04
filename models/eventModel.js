const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    images: [
      {
        type: String, // Assuming each element in the array is a URL
      },
    ],
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
    },
    totalSeats: {
      type: Number,
      required: [true, "Total seats is required"],
    },
    availableSeats: {
      type: Number,
      required: [true, "Total seats is required"],
    },
    ticketPrice: {
      type: Number,
      required: [true, "Ticket price is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming your user model is named 'User'
      required: [true, "Created by user is required"],
    },
  },
  {
    collection: "events",
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
