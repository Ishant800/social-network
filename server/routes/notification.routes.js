const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const {
  streamNotifications,
  getNotifications,
  markAllRead,
  markOneRead,
} = require('../controllers/notification.controller');

const router = express.Router();

// SSE stream — server-sent events, read-only, no client response
router.get('/stream',        verifyToken, streamNotifications);

// REST
router.get('/',              verifyToken, getNotifications);
router.put('/read',          verifyToken, markAllRead);
router.put('/:id/read',      verifyToken, markOneRead);

module.exports = router;
