const express = require('express');
const { updateProfile } = require('../controllers/user.controller');
const { upload } = require('../config/cloudinary.config');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.put(
  '/update-profile/:id',
  verifyToken,
  upload.single('profileImage'),
  updateProfile,
);

module.exports = router;
