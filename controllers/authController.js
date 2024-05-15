const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const jWT_SECRET = process.env.JWT_SECRET;

// Login API
const login = async (req, res) => {
  // Login logic
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({
      status: 400,
      message: "Both username and password are required",
    });
  }

  // Find the user in the database    //email.toLowerCase(),
  let user = await User.findOne({ email: username.toLowerCase() }).lean();

  //Code for Mobile phone validation

  // if (!user) {
  //   const apiKey = "fc1ec9e5bc504c72b44eb84625ba6112";
  //   const phoneValidationApiUrl = `https://phonevalidation.abstractapi.com/v1/?api_key=${apiKey}&phone=${encodeURIComponent(
  //     username.replace(/[\s+]/g, "")
  //   )}`;

  //   const phoneValidationResponse = await axios.get(phoneValidationApiUrl);
  //   console.log(phoneValidationResponse.data.format.international);
  //   user = await User.findOne({
  //     phone_number: phoneValidationResponse.data.format.international,
  //   }).lean();
  // }


  console.log(user);

  if (!user) {
    // User not found
    return res.status(404).json({
      status: 404,
      message: "Invalid username or password",
    });
  }

  // Compare the provided password with the hashed password stored in the database
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (passwordMatch) {
    // Passwords match, send a successful login response
    console.log("passwords match");
    console.log(jWT_SECRET)
    const token = jwt.sign(
      {
        id: user._id,
        username: user.email,
      },
      jWT_SECRET
    );
    console.log(token);
    console.log(user);
    const { _id, full_name, profileImage, phone_number, email, role } = user;
    const newUserObject = {
      _id,
      full_name,
      profileImage,
      phone_number,
      email,
      role,
    };
    return res.status(200).json({
      status: 200,
      message: "Login successful",
      user: newUserObject,
      data: token,
    });
  } else {
    // Passwords do not match
    return res.status(401).json({
      status: 401,
      message: "Invalid username or password",
    });
  }
};

// Register/SignUP API
const register = async (req, res) => {
  try {
    console.log("req body:", req.body);
    let { full_name, phone_number, role, email, password } = req.body;
    if (!full_name || !phone_number || !role || !email || !password) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Missing or empty values for required fields.",
      });
    }

    // Validate phone number using the Abstract Phone Validation API
    // const apiKey = "fc1ec9e5bc504c72b44eb84625ba6112";
    // const phoneValidationApiUrl = `https://phonevalidation.abstractapi.com/v1/?api_key=${apiKey}&phone=${encodeURIComponent(
    //   phone_number.replace(/[\s+]/g, "")
    // )}`;

    // const phoneValidationResponse = await axios.get(phoneValidationApiUrl);
    // console.log(phoneValidationResponse.data.format.international);
    // if (!phoneValidationResponse.data.valid) {
    //   return res.status(400).json({
    //     status: 400,
    //     message: "Invalid phone number. Must be in Internation format",
    //   });
    // }


    // console.log("Uploaded image details:", {
    //   fieldname: my_image.fieldname,
    //   originalname: my_image.originalname,
    //   encoding: my_image.encoding,
    //   mimetype: my_image.mimetype,
    //   size: my_image.size,
    // });

    //checking if user already exists
    let user = await User.findOne({ email: email });

    // uncomment following code when you activate phone validation API

    // if (!user) {
    //   user = await User.findOne({
    //     phone_number: phoneValidationResponse.data.format.international,
    //   });
    // }
    if (user) {
      return res
        .status(400)
        .json({ status: 400, message: "User already exists" });
    }

    // Hash the password
    password = await bcrypt.hash(password, 10);

    // Upload image to Cloudinary

    let response = await User.create({
      full_name: full_name,

      // phone_number: phoneValidationResponse.data.format.international,
      phone_number: phone_number,
      role: role.toLowerCase(),
      email: email.toLowerCase(),
      password: password,
    });

    return res.json({ status: 200, message: "User created successfully" });
  } catch (error) {
    console.error("Error:", error);
    if (error.code === 11000) {
      return res.json({ status: 11000, message: "Username already exists" });
    }
    let validationErrors = [];
    if (error.errors) {
      for (const key in error.errors) {
        validationErrors.push(error.errors[key].message);
      }
      return res.status(400).json({ status: 400, messages: validationErrors });
    }
    return res.json({ status: "error", message: "Format issue" });
  }
};

module.exports = {
  login,
  register,
};
