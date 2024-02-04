// File: fileUploadUtils.js

const multer = require("multer");

// Configure Cloudinary
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dx3kgoad5",
  api_key: "933237834665596",
  api_secret: "43j-6Q4RLCuX1N6Ck4PYUvqfwmE",
});

// Set up Multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // Specify the directory where uploaded files should be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});
const upload = multer({ storage: storage });

// Function to upload a single file to Cloudinary
const uploadSingleFile = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
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
  // console.log("files: ", files);

  try {
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "images",
        public_id: `${Date.now()}`,
        resource_type: "auto",
        encoding: "7bit",
      });
      // console.log(result);
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

const uploadSingleMiddleware = upload.single("image"); // Middleware for single file upload
const uploadMultipleMiddleware = upload.array("images"); // Middleware for multiple file upload

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadSingleMiddleware,
  uploadMultipleMiddleware,
};
