const express = require('express');
const { getPostsFeed, getBlogsFeed } = require('../controllers/feed.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Get posts feed
router.get('/posts', verifyToken, getPostsFeed);

// Get blogs feed
router.get('/blogs', verifyToken, getBlogsFeed);
  
module.exports = router;
