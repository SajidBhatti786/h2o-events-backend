const OTP = require('../models/OTPModel');

/**
 * Create a new OTP
 * @param {Object} otpData - OTP object
 * @returns {Object} - The created OTP object
 * @throws {Error} - Throws error if the operation fails
 */
const createOTP = async (otpData) => {
    try {
        return await OTP.create(otpData);
    } catch (error) {
        console.error("Error creating OTP:", error);
        throw new Error("Failed to create OTP.");
    }
}

/**
 * Get OTP by ID
 * @param {string} otpId - OTP ID
 * @returns {Object} - The OTP object
 * @throws {Error} - Throws error if the operation fails
 */
const getOTPById = async (otpId) => {
    try {
        return await OTP.findById(otpId);
    } catch (error) {
        console.error("Error fetching OTP:", error);
        throw new Error("Failed to fetch OTP.");
    }
}

/**
 * Get an active, not expired, and unused OTP by email
 * @param {string} email - Email
 * @returns {Object} - The OTP object
 * @throws {Error} - Throws error if the operation fails
 */
const getActiveOTPByEmail = async (email) => {
    try {
        return await OTP.findOne({
            email: email,
            expiresAt: { $gt: new Date() }, // checks if the OTP is not expired
            isUsed: false // checks if the OTP has not been used
        }).sort({ createdAt: -1 }); // sorts by creation time in ascending order
    } catch (error) {
        console.error("Error fetching OTP:", error);
        throw new Error("Failed to fetch OTP.");
    }
}

/**
 * Invalidate an OTP by setting it as used
 * @param {string} otpId - OTP ID to invalidate
 * @returns {Object} - The updated OTP object
 * @throws {Error} - Throws error if the operation fails
 */
const invalidateOTP = async (otpId) => {
    try {
        const otp = await OTP.findByIdAndUpdate(otpId, { isUsed: true }, { new: true });
        if (!otp) {
            throw new Error("OTP not found.");
        }
        return otp;
    } catch (error) {
        console.error("Error invalidating OTP:", error);
        throw new Error("Failed to invalidate OTP.");
    }
}

/**
 * Exporting the OTPService object
 */
module.exports = {
    createOTP,
    getOTPById,
    getActiveOTPByEmail,
    invalidateOTP,
};
