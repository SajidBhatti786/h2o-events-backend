const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const jWT_SECRET = process.env.JWT_SECRET;
const OTP = require("../models/OTPModel")
const { sendEmailWithOTP } = require("../utils/mailTransporter");
const { generateOTP } = require("../utils/otpGenerate");
const OTPService = require("../services/OTPService");
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


/**
 * Get email from user for password reset and send OTP to the email
 * @param {*} req 
 * @param {*} res 
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  console.log("Response Body: ", req.body);

  if (!email) {
      return res.status(400).send("Email address is required.");
  }

  try {
      const user = await User.findOne({ email });
      if (!user) {
        return res
        .status(400)
        .json({ status: 400, message: "User not found" });
      }

      const generatedOTP = generateOTP();

      // send OTP to the user's email
      const info = await sendEmailWithOTP("Support H2O Events", email, "Password Reset OTP", `Your OTP is ${generatedOTP}`, `<p>Your OTP is <b>${generatedOTP}</b></p>`);
      console.log("INFOOOOOOOO: ",info);

      // create OTP record in the database
      const otpData = {
          email: email,
          otp: generatedOTP,
          isUsed: false,
          expiresAt: new Date(Date.now() + 600000), // 10 minutes from now
      };

      const otpRecord = await OTPService.createOTP(otpData)
      console.log("OTP Record:", otpRecord);

      return res.status(200).send("OTP has been sent to your email. Please check your inbox to proceed.");
  } catch (error) {
      console.error("Error in forgotPassword:", error);
      res.status(500).send("An error occurred while processing your request.");
  }
};

/**
* Verify OTP sent to user's email
* @param {*} req 
* @param {*} res 
* @returns 
*/
const verifyOTP = async (req, res) => {
  console.log("Verifying OTP sent to user");
  const { email, otp } = req.body;
  

  if (!email || !otp) {
      return res.status(400).send("Email and OTP are required.");
  }

  try {
    const otpRecord = await OTPService.getActiveOTPByEmail(email);

      if (!otpRecord) {
          return res.status(404).send("OTP not found or has expired.");
      }

      console.log("OTP is : ", otp);

      if (otpRecord.otp !== otp) {
          return res.status(401).send("Invalid OTP.");
      }

      await OTPService.invalidateOTP(otpRecord._id);

      return res.status(200).send("OTP verified successfully.");
  } catch (error) {
      console.log("Error in verifyOTP:", error);
      res.status(500).send("An error occurred while verifying the OTP.");
  }
};

/**
* Reset user password
* @param {*} req 
* @param {*} res 
* @returns 
*/
const resetPassword = async (req, res) => {
  const { email, username, password } = req.body;

  if (!email && !username) {
      return res.status(400).send("Email or username is required");
  }

  if (!password) {
      return res.status(400).send("Password is required");
  }

  try {
      const hashPassword = await bcrypt.hash(password, 10);
      const query = username ? { username } : { email };

      const user = await User.findOne(query);

      if (!user) {
          return res.status(404).send("User not found");
      }

      user.password = hashPassword;
      await user.save();

      // const tokens = jwtTokens(user); // assuming jwtTokens is a function that generates tokens

      user.password = undefined;

      res.status(200).send({
          // tokens: tokens,
          // user: user,
          message: "Password reset successful"
      });
  } catch (err) {
      console.error("Error in resetPassword:", err);
      res.status(500).send("An error occurred while processing your request.");
  }
};

/**
* Logout user by clearing the cookies
* @param {*} req 
* @param {*} res 
*/
const logout = async (req, res) => {
  try {
      res.clearCookie("access_token");
      res.clearCookie("refresh_token");
      res.clearCookie("user");
      res.status(200).send("User has logged out successfully.");
  } catch (err) {
      console.error("Error in logout:", err);
      res.status(500).send("An error occurred while logging out.");
  }
};



module.exports = {
  login,
  register,
  forgotPassword,
  verifyOTP,
  resetPassword,
  logout,
};
