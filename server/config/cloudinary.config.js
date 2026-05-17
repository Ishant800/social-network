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
const VOICE_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']);
const VOICE_MIMES = new Set([
  'audio/webm',
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/wav',
  'audio/ogg',
  'audio/x-m4a',
  'audio/aac',
  'video/webm',
]);

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'meroroom',
    allowed_formats: ['jpeg', 'jpg', 'png', 'webp', 'avif'],
    transformation: [{ height: 1000, width: 1000, crop: 'limit' }],
  },
});

const voiceStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'meroroom/voice',
    resource_type: 'video',
    allowed_formats: ['webm', 'mp3', 'm4a', 'wav', 'ogg', 'mp4'],
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

const uploadVoice = multer({
  storage: voiceStorage,
  limits: { fileSize: VOICE_MAX_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!VOICE_MIMES.has(String(file.mimetype).toLowerCase())) {
      return cb(new Error('Only audio recordings are allowed (WebM, MP3, M4A, WAV, OGG)'));
    }
    cb(null, true);
  },
});

module.exports = { upload, uploadVoice, cloudinary };
