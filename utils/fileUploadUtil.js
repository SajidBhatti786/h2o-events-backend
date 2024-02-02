// File: fileUploadUtils.js

const multer = require("multer");

// Configure Cloudinary
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dx3kgoad5",
  api_key: "933237834665596",
  api_secret: "43j-6Q4RLCuX1N6Ck4PYUvqfwmE",
});

// Set up Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Function to upload a single file to Cloudinary
const uploadSingleFile = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.buffer, {
      folder: "images",
    });

    return {
      imageUrl: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to upload file to Cloudinary");
  }
};

// Function to upload multiple files to Cloudinary
const uploadMultipleFiles = async (files) => {
  const uploadedFilesInfo = [];

  try {
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.buffer, {
        folder: "images",
      });

      uploadedFilesInfo.push({
        imageUrl: result.secure_url,
        publicId: result.public_id,
      });
    }

    return uploadedFilesInfo;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to upload files to Cloudinary");
  }
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadSingleMiddleware: upload.single("image"), // Middleware for single file upload
  uploadMultipleMiddleware: upload.array("images", 5), // Middleware for multiple file upload (up to 5 files)
};
