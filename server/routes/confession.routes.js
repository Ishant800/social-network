const express = require('express');
const {
  createConfession,
  getConfessions,
  getVoiceStories,
  getTrendingConfessions,
  getConfessionDetails,
  createAnonymousReply,
  getAnonymousComments,
} = require('../controllers/confession.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateObjectId } = require('../middleware/validateObjectId.middleware');
const { uploadVoice } = require('../config/cloudinary.config');

const router = express.Router();

router.post('/create', verifyToken, uploadVoice.single('voice'), createConfession);
router.get('/feed', verifyToken, getConfessions);
router.get('/voice-stories', verifyToken, getVoiceStories);
router.get('/trending', verifyToken, getTrendingConfessions);
router.get('/:postId', verifyToken, validateObjectId('postId'), getConfessionDetails);
router.get('/:postId/comments', verifyToken, validateObjectId('postId'), getAnonymousComments);
router.post('/:postId/reply', verifyToken, validateObjectId('postId'), createAnonymousReply);

module.exports = router;
