const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { connectToDatabase } = require("./config/database");
const app = express();
const http = require("http");
const server = http.createServer(app);
// const friendsController = require("./controllers/friendsController");

require("dotenv").config();

const port = process.env.PORT;

const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions)) // Use this after the variable declaration
app.use(express.static(path.join(__dirname, "static")));
app.use(bodyParser.json());

// Connect to the database before starting the server
const startServer = async () => {
  try {
    await connectToDatabase();

    // Set up static files and views
    app.use(express.static(path.join(__dirname, "public")));

    const authRoutes = require("./routes/authRoute");
    const eventRoutes = require("./routes/eventRoute");
    const ticketRoutes = require("./routes/ticketRoute");
    const userRoutes = require("./routes/userRoute");
    // Use routes
    app.use("/api/auth", authRoutes);
    app.use("/api/event", eventRoutes);
    app.use("/api/ticket", ticketRoutes);
    app.use("/api/user", userRoutes);
    // Set CORS for specific routes
    app.use(cors({ origin: "*" }));

    server.listen(port, () => {
      console.log("Server listening on port: " + port);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

// Start the server
startServer();
