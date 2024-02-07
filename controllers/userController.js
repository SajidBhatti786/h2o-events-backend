const User = require("../models/userModel");
const { uploadSingleFile } = require("../utils/fileUploadUtil");
const getSingleUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId);
    // Check if the user ID is provided
    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID is required in the request body" });
    }

    // Check if the user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Exclude sensitive information like password before sending the response
    const sanitizedUser = {
      _id: user._id,
      full_name: user.full_name,
      profileImage: user.profileImage,
      phone_number: user.phone_number,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json(sanitizedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const changeProfileImage = async (req, res) => {
  try {
    // Assuming the user ID is decoded from the token and available in req.decoded
    const userId = req.decoded.id;

    // Get the user from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the request contains a file (profile image)
    console.log(req.file);
    if (!req.file) {
      return res.status(400).json({ message: "No profile image provided" });
    }

    // Upload the new profile image to Cloudinary
    const newImage = await uploadSingleFile(req.file);
    console.log(newImage);
    // Update the user's profile image URL in the database
    user.profileImage = newImage.imageUrl;
    await user.save();

    res
      .status(200)
      .json({ message: "Profile image updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getSingleUser,
  changeProfileImage,
};
