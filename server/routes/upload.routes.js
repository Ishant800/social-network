const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary.config');

const router = express.Router();

// Upload single image - same as backend blog/user upload
router.post('/image', verifyToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Return same structure as multer-storage-cloudinary
    return res.status(200).json({
      success: true,
      file: {
        url: req.file.path,
        public_id: req.file.filename,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Upload multiple images
router.post('/images', verifyToken, upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    // Return array of uploaded files
    const files = req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
    }));

    return res.status(200).json({
      success: true,
      files,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
