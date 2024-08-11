const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const upload = multer();
const dotenv = require('dotenv')

dotenv.config();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

async function uploadImageToCloudinary(fileBuffer) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }).end(fileBuffer);
    });
  }

module.exports = {cloudinary,uploadImageToCloudinary};

