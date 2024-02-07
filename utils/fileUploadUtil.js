// File: fileUploadUtils.js

const multer = require("multer");
const axios = require("axios");

// Configure Cloudinary
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Multer for handling file uploads
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });

// Function to upload a single file to Cloudinary
const uploadSingleFile = async (file) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "images",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      streamifier.createReadStream(file.buffer).pipe(stream);
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

const uploadMultipleFiles = async (files) => {
  const uploadedFilesInfo = [];
  console.log(files);

  try {
    await Promise.all(
      files.map(async (file) => {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "images",
              public_id: `${Date.now()}`,
              resource_type: "auto",
              encoding: "7bit",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          streamifier.createReadStream(file.buffer).pipe(stream);
        });

        uploadedFilesInfo.push({
          imageUrl: result.secure_url,
          publicId: result.public_id,
        });
      })
    );

    return uploadedFilesInfo;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to upload files to Cloudinary");
  }
};

const uploadSingleMiddleware = upload.single("image"); // Middleware for single file upload
const uploadMultipleMiddleware = upload.array("images"); // Middleware for multiple file upload

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadSingleMiddleware,
  uploadMultipleMiddleware,
};
