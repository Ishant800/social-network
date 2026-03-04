const express = require('express');
const {
  createPost,
  getMyPost,
  getPostDetails,
  updatePost,
  randomPosts,
} = require('../controllers/post.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary.config');

const router = express.Router();

router.post(
  '/create',
  verifyToken,
  upload.array('media', 5),
  createPost,
);
router.get('/randomposts',randomPosts);

router.get('/myPost', verifyToken, getMyPost);
router.get('/post-details/:postId', verifyToken, getPostDetails);
router.put(
  '/update/:postId',
  verifyToken,
  upload.array('media', 5),
  updatePost,
);

module.exports = router;
