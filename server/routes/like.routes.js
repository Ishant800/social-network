const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateObjectId } = require('../middleware/validateObjectId.middleware');
const { likePost, unlikePost, likeBlog, unlikeBlog, reactToPost, removeReaction } = require('../controllers/like.controller');
const router = express.Router();

// Post reactions (new)
router.post('/post/:postId/react', verifyToken, validateObjectId('postId'), reactToPost);
router.delete('/post/:postId/react', verifyToken, validateObjectId('postId'), removeReaction);

// Post likes (backward compat)
router.post('/post/:postId/like', verifyToken, validateObjectId('postId'), likePost);
router.delete('/post/:postId/unlike', verifyToken, validateObjectId('postId'), unlikePost);

// Blog likes
router.post('/blog/:blogId/like', verifyToken, validateObjectId('blogId'), likeBlog);
router.delete('/blog/:blogId/unlike', verifyToken, validateObjectId('blogId'), unlikeBlog);

module.exports = router;
 