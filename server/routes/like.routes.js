const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateObjectId } = require('../middleware/validateObjectId.middleware');
const { likePost, unlikePost, likeBlog, unlikeBlog } = require('../controllers/like.controller');
const router = express.Router();

// Post likes
router.post('/post/:postId/like', verifyToken, validateObjectId('postId'), likePost);
router.delete('/post/:postId/unlike', verifyToken, validateObjectId('postId'), unlikePost);

// Blog likes
router.post('/blog/:blogId/like', verifyToken, validateObjectId('blogId'), likeBlog);
router.delete('/blog/:blogId/unlike', verifyToken, validateObjectId('blogId'), unlikeBlog);

module.exports = router;
 