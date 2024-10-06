const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.storage = (folder) => {
  return new cloudinaryStorage({
    cloudinary,
    params: {
      folder, // folder name
      allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed image formats
    },
  });
};
