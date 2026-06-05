const express = require('express');

<<<<<<< Updated upstream
const {  login,  register } = require('../controllers/auth.controller');
=======
const {
  login,
  register,
  forgotPassword,
  resetPassword,
  setupUserInterests,
} = require('../controllers/auth.controller');
>>>>>>> Stashed changes

const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
<<<<<<< Updated upstream
=======
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
>>>>>>> Stashed changes

/**
 * POST /auth/setup-interests
 * Setup user interests after signup
 * Protected: Requires authentication
 * Body: { interests: [String] }
 */
router.post('/setup-interests', verifyToken, setupUserInterests);

module.exports = router;