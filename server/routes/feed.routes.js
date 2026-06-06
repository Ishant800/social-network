const express = require('express');
const { getPostsFeed, getBlogsFeed, updateInterestScores } = require('../controllers/feed.controller');
const { getExploreFeed } = require('../controllers/recommendation.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Get posts feed (personalized)
router.get('/posts', verifyToken, getPostsFeed);

// Get blogs feed
router.get('/blogs', verifyToken, getBlogsFeed);

// Explore page: personalized posts + blogs
router.get('/explore', verifyToken, getExploreFeed);

// Update interest scores based on user interaction
router.post('/interest-scores', verifyToken, updateInterestScores);
  
module.exports = router;
