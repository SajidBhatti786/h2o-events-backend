// File: fileUploadUtils.js

const multer = require("multer");
const axios = require("axios");
// Configure Cloudinary
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
//compress videos
const sharp = require('sharp');
const mime = require('mime-types'); // To detect the MIME type of files
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Multer for handling file uploads
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });



const compressVideo = (inputBuffer, mimeType) => {
  const ff = ffmpeg(inputBuffer)
  .fps(30)
  .addOptions(["-crf 28"])
  .on("end", () => { 
    endProcess({ statusCode: 200, text: "Success" });
    
  })
  .on("error", (err) => {
    endProcess({ statusCode: 500, text: err.message });
  })

  return ff;
};


  // console.log('mimeType: ' + mimeType)
  // return new Promise((resolve, reject) => {
  //   const chunks = [];
  //   const stream = ffmpeg()
  //   process.then(() =>{
  //     console.log('process.then()')

  //   })
  //     .input(streamifier.createReadStream(inputBuffer))
  //     .inputFormat('mov')
  //     .videoCodec('libx264')
  //     .size('1280x?') // Resize to width 1280px, maintaining aspect ratio
  //     .format('mp4') // Output format
  //     .on('error', (err) => {
  //       reject(err);
  //     })
  //     .on('end', () => {
  //       resolve(Buffer.concat(chunks));
  //     })
  //     .pipe()
  //     .on('data', (chunk) => {
  //       chunks.push(chunk);
  //     });
  // });
// };


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
  console.log("Files to upload:", files);

  try {
    await Promise.all(
      files.map(async (file) => {
        const mimeType = mime.lookup(file.originalname);

        let bufferToUpload = file.buffer;

        if (mimeType && mimeType.startsWith('image/')) {
          // Resize the image using sharp (optional, adjust as needed)
          bufferToUpload = await sharp(file.buffer)
            .resize({ width: 800 })
            .toBuffer();
        }

        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "media",
              public_id: `${Date.now()}`,
              resource_type: "auto",
              timeout: 120000000, // Timeout set to 120 seconds (2 minutes)
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          streamifier.createReadStream(bufferToUpload).pipe(stream);
        });

        uploadedFilesInfo.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      })
    );

    console.log("Uploaded files:", uploadedFilesInfo);
    return uploadedFilesInfo;
  } catch (error) {
    console.error("Error uploading files:", error);
    throw new Error("Failed to upload files to Cloudinary");
  }
};
const uploadSingleMiddleware = upload.single("image"); // Middleware for single file upload
const uploadMultipleMiddleware = upload.array("mediaFiles"); // Middleware for multiple file upload

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadSingleMiddleware,
  uploadMultipleMiddleware,
};
