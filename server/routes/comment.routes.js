const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const {
  createComment,
  getPostComments,
  deleteComment,
} = require('../controllers/comment.controller');

const router = express.Router();

router.post('/create/:postId', verifyToken, createComment);
router.get('/getComment/:postId', getPostComments);
router.delete('/delete/:commentId', verifyToken, deleteComment);

module.exports = router;
