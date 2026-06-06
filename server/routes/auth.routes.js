const express = require('express');

const {
  login,
  register,
  forgotPassword,
  resetPassword,
  setupUserInterests,
} = require('../controllers/auth.controller');

const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


router.post('/setup-interests', verifyToken, setupUserInterests);

module.exports = router;