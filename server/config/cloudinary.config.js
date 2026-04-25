const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']);

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'meroroom',
    allowed_formats: ['jpeg', 'jpg', 'png', 'webp', 'avif'],
    transformation: [{ height: 1000, width: 1000, crop: 'limit' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_BYTES, files: 10 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIMES.has(String(file.mimetype).toLowerCase())) {
      return cb(new Error('Only JPEG, PNG, WebP, or AVIF images are allowed'));
    }
    cb(null, true);
  },
});

module.exports = { upload, cloudinary };
