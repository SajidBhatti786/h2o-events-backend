const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const User = require("../models/userModel");

const authenticationVerifier = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }
console.log("verifying token")
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    console.log("verifying token")
    if (err) {
      return res.status(401).json({ message: "Failed to authenticate token" });
    }
    req.decoded = decoded;
    next();
  });
};

const isAdminVerifier = async (req, res, next) => {
  const token = req.headers.authorization;
  

  try {
    // Decode the token to get user ID
    console.log("verifying token")
    // console.log(req.body)
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("verifying token")    // Fetch the user from the database based on the 'id'
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    // Check if the user has the 'admin' role
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized access. Admin role required." });
    }

    // If the user is considered an admin, proceed to the next middleware or route handler
    req.decoded = decoded;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      // Token verification failed
      return res.status(401).json({ message: "Failed to authenticate token" });
    } else {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

module.exports = {
  authenticationVerifier,
  isAdminVerifier,
};
