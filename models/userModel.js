const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: [true, "name is required"],
    },
    profileImage: {
      type: String,
      default: "",
    },
    phone_number: {
      type: String,

      required: [true, "Phone number is required"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },

    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "please provide an valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

const model = mongoose.model("User", userSchema);
// model.index({ email: 1 });
// userSchema.users.ensureIndex({ email: 1 }, { unique: true, sparse: true });
module.exports = model;
