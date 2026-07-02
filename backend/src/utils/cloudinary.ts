import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Configure Cloudinary using process.env directly to allow flexible runtime keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a raw memory file buffer directly to Cloudinary using streaming.
 * This avoids writing files to disk.
 */
export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string,
  resourceType: 'auto' | 'image' | 'raw' = 'auto'
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Cloudinary upload returned no result'));
        resolve(result);
      }
    );

    // Stream the memory buffer directly to the API endpoint
    uploadStream.end(fileBuffer);
  });
};
