const nodemailer = require('nodemailer');
const { google } = require('googleapis');

require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
console.log("Client ID: ", CLIENT_ID);
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });


async function sendEmailWithOTP(subject, to, generatedOTP,full_name) {
    try {
      const accessToken = await oAuth2Client.getAccessToken(); // Ensure this call is awaited
  
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.USER_EMAIL,
          clientId: CLIENT_ID, // Correct case
          clientSecret: CLIENT_SECRET, // Correct case
          refreshToken: REFRESH_TOKEN, // Correct case
          accessToken: accessToken.token, // Pass accessToken dynamically
        },
      });
  
      const mailOptions = {
        from: `"Support H2O Events" <${process.env.USER_EMAIL}>`,
        to: to,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="background-color: #f7f7f7; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://h2o-ent.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.c8bca4f1.png&w=640&q=75" alt="H2OEvents Logo" style="max-width: 150px;">
                <div style="color: black; font-size: 24px; margin-top: 10px;">H2O Events</div>
              </div>
              <h1 style="background-color: #000000; color: white; padding: 10px; border-radius: 8px;">${subject}</h1>
              <p style="font-size: 16px;">Hello, ${full_name}</p>
              <p style="font-size: 16px;">Your OTP is: <b>${generatedOTP}</b></p>
              <p style="font-size: 16px;">If you did not request this OTP, please disregard this email.</p>
              <p style="font-size: 16px;">Best regards,<br>Support Team<br>H2O Events</p>
            </div>
          </div>
        `,
      };
  
      const info = await transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      throw error; // Rethrow the error to handle it outside this function if necessary
    }
  }
module.exports = {
    sendEmailWithOTP,
};
