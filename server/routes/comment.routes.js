const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
} = require('../controllers/comment.controller');

const router = express.Router();

router.post('/create/:postId', verifyToken, createComment);
router.get('/getComment/:postId', getPostComments);
router.put('/update/:commentId', verifyToken, updateComment);
router.delete('/delete/:commentId', verifyToken, deleteComment);

module.exports = router;
