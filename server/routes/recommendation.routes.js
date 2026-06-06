const express = require('express');
const router = express.Router();
const {
  getPersonalizedFeed,
  getExploreFeed,
  trackView,
  trackReaction,
  trackComment,
  trackBookmark,
  trackShare,
  trackBlogRead
} = require('../controllers/recommendation.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// ====================================
// FEED ENDPOINTS
// ====================================

/**
 * GET /api/recommendation/feed
 * Get personalized feed for authenticated user
 * Query params: limit, page
 */
router.get('/feed', verifyToken, getPersonalizedFeed);

/**
 * GET /api/recommendation/explore
 * Posts + blogs for explore page (70% interest, 20% following, 10% discovery)
 */
router.get('/explore', verifyToken, getExploreFeed);

// ====================================
// INTERACTION TRACKING ENDPOINTS
// ====================================

/**
 * POST /api/recommendation/track/view
 * Track when user views content
 * Body: { contentType, contentId }
 */
router.post('/track/view', verifyToken, trackView);

/**
 * POST /api/recommendation/track/reaction
 * Track when user reacts to content
 * Body: { contentType, contentId, reactionType }
 */
router.post('/track/reaction', verifyToken, trackReaction);

/**
 * POST /api/recommendation/track/comment
 * Track when user comments on content
 * Body: { contentType, contentId }
 */
router.post('/track/comment', verifyToken, trackComment);

/**
 * POST /api/recommendation/track/bookmark
 * Track when user bookmarks content
 * Body: { contentType, contentId }
 */
router.post('/track/bookmark', verifyToken, trackBookmark);

/**
 * POST /api/recommendation/track/share
 * Track when user shares content
 * Body: { contentType, contentId }
 */
router.post('/track/share', verifyToken, trackShare);

/**
 * POST /api/recommendation/track/blog-read
 * Track blog read progress
 * Body: { contentId, readPercentage }
 */
router.post('/track/blog-read', verifyToken, trackBlogRead);

module.exports = router;
