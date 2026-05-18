const express = require('express');
const {
  createPost,
  getMyPost,
  getPostDetails,
  updatePost,
  deletePost,
  bulkpostinsert,
  cleanupImages,
} = require('../controllers/post.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateObjectId } = require('../middleware/validateObjectId.middleware');
const { upload } = require('../config/cloudinary.config');

const router = express.Router();

router.post('/create', verifyToken, createPost);
router.get('/myPost', verifyToken, getMyPost);
router.get('/post-details/:postId', verifyToken, validateObjectId('postId'), getPostDetails);
router.put('/update/:postId', verifyToken, validateObjectId('postId'), updatePost);
router.delete('/delete/:postId', verifyToken, validateObjectId('postId'), deletePost);
router.post('/cleanup-images', verifyToken, cleanupImages);
router.post("/bulkposts",bulkpostinsert)
module.exports = router;
