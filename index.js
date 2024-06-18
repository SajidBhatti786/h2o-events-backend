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
const corsOptions = {
  origin: "*", // Allow requests from any origin
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ], // Allow these headers
  exposedHeaders: ["Content-Disposition"], // Allow these headers to be exposed
  credentials: true, // Allow credentials such as cookies, authorization headers, etc.
  maxAge: 3600, // Cache preflight requests for 1 hour
  preflightContinue: false, // Disable preflight request handling in route handlers
  optionsSuccessStatus: 200, // Return status code 200 for successful preflight requests
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true, limit: "150mb" }));

app.use((req, res, next) => {
  res.header({"Access-Control-Allow-Origin": "*"});
  next();
}) 
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
    const stripeRoutes = require("./routes/stripeRoute");
    // Use routes
    app.use("/api/auth", authRoutes);
    app.use("/api/event", eventRoutes);
    app.use("/api/ticket", ticketRoutes);
    app.use("/api/user", userRoutes);
    app.use("/api/stripe", stripeRoutes);
    // Set CORS for specific routes
   
    server.listen(port, () => {
      console.log("Server listening on port: " + port);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

// Start the server
startServer();
