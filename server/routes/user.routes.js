const express = require('express');
const { updateProfile, getMe } = require('../controllers/user.controller');
const { upload } = require('../config/cloudinary.config');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.put(
  '/update-profile/:id',
  verifyToken,
  upload.single('profileImage'),
  updateProfile,
);

router.get(
  '/getMe',
  verifyToken,
  getMe
);

module.exports = router;
