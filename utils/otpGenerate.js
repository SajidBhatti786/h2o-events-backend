const otpGenerator = require('otp-generator');

// Function to generate an OTP
function generateOTP() {
    return otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
}
console.log(generateOTP());

module.exports = {
    generateOTP
};
