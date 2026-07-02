// cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 1. Authenticate with your Cloudinary credentials
cloudinary.config({
  cloud_name: 'q8xci48o', // Replace with your credentials
  api_key: '939936159133768',
  api_secret: '6mvLlE4wFEUPKeMeBVMVp5uvdmY'
});



// 2. Configure the storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'homely_images', // The folder name created inside your Cloudinary account
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

// 3. Export the customized multer instance
const uploadCloud = multer({ storage: storage });

module.exports = { uploadCloud };