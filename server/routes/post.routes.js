const express = require('express');
const {
  createPost,
  getMyPost,
  getPostDetails,
  updatePost,
  deletePost,
} = require('../controllers/post.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateObjectId } = require('../middleware/validateObjectId.middleware');
const { upload } = require('../config/cloudinary.config');

const router = express.Router();

router.post('/create', verifyToken, upload.array('media', 5), createPost);
router.get('/myPost', verifyToken, getMyPost);
router.get('/post-details/:postId', verifyToken, validateObjectId('postId'), getPostDetails);
router.put('/update/:postId', verifyToken, validateObjectId('postId'), upload.array('media', 5), updatePost);
router.delete('/delete/:postId', verifyToken, validateObjectId('postId'), deletePost);

module.exports = router;
