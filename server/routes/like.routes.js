const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateObjectId } = require('../middleware/validateObjectId.middleware');
const { postLike, unLike } = require('../controllers/like.controller');
const router = express.Router();

router.post('/post/like/:postId', verifyToken, validateObjectId('postId'), postLike);
router.post('/post/unlike/:postId', verifyToken, validateObjectId('postId'), unLike);


module.exports = router;
 