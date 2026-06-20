const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

let isCloudinaryConfigured = false;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
  isCloudinaryConfigured = true;
  console.log('Cloudinary storage service configured successfully.');
} else {
  console.log('Cloudinary credentials missing. File uploads will default to local storage.');
}

const uploadToCloudinary = async (filePath) => {
  if (!isCloudinaryConfigured) return null;
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'intervai_resumes',
      resource_type: 'auto'
    });
    
    // Delete local temporary file after successful upload to Cloudinary
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failure:', error.message);
    throw new Error('Cloudinary upload failed: ' + error.message);
  }
};

module.exports = { uploadToCloudinary, isCloudinaryConfigured };
