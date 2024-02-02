const User = require("../models/userModel");

const getSingleUser = async (req, res) => {
  try {
    const userId = req.params.userId;

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

module.exports = {
  getSingleUser,
};
