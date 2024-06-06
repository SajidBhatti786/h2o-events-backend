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

async function sendEmailWithOTP(name, to, subject, text, html) {
    try {
        const accessToken = await oAuth2Client.getAccessToken();  // Ensure this call is awaited

        const transporter =  nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.USER_EMAIL,
                clientId: CLIENT_ID,          // Correct case
                clientSecret: CLIENT_SECRET,  // Correct case
                refreshToken: REFRESH_TOKEN,  // Correct case
                accessToken: accessToken.token  // Pass accessToken dynamically
            }
        });

        const mailOptions = {
            from: `${name} <${process.env.USER_EMAIL}>`,
            to: to,
            subject: subject,
            text: text,
            html: html,
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Failed to send OTP email:', error);
        throw error;  // Rethrow the error to handle it outside this function if necessary
    }
}

module.exports = {
    sendEmailWithOTP,
};
