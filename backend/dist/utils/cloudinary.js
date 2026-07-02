"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
// Configure Cloudinary using process.env directly to allow flexible runtime keys
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
/**
 * Uploads a raw memory file buffer directly to Cloudinary using streaming.
 * This avoids writing files to disk.
 */
const uploadToCloudinary = (fileBuffer, folder, resourceType = 'auto') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder,
            resource_type: resourceType,
        }, (error, result) => {
            if (error)
                return reject(error);
            if (!result)
                return reject(new Error('Cloudinary upload returned no result'));
            resolve(result);
        });
        // Stream the memory buffer directly to the API endpoint
        uploadStream.end(fileBuffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
