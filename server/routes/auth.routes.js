const express = require('express');
const rateLimit = require('express-rate-limit');
const { createUser, login, refresh } = require('../controllers/auth.controller');

const router = express.Router();

const authWindowMs = Number(process.env.AUTH_RATE_WINDOW_MS) || 15 * 60 * 1000;
const authMax = Number(process.env.AUTH_RATE_MAX) || 25;

const strictAuthLimiter = rateLimit({
  windowMs: authWindowMs,
  max: authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Try again later.' },
});

const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many refresh requests.' },
});

router.post('/signup', strictAuthLimiter, createUser);
router.post('/login', strictAuthLimiter, login);
router.post('/refresh', refreshLimiter, refresh);

module.exports = router;
