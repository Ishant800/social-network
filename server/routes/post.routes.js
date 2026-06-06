const express = require('express');
const {
  createPost,
  getMyPost,
  getPostDetails,
  updatePost,
  deletePost,
  bulkpostinsert,
} = require('../controllers/post.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateObjectId } = require('../middleware/validateObjectId.middleware');
const { upload } = require('../config/cloudinary.config');

const router = express.Router();

// Post endpoints - Backend handles file uploads with multer
router.post('/create', verifyToken, upload.array('files', 5), createPost);
router.get('/myPost', verifyToken, getMyPost);
router.get('/post-details/:postId', verifyToken, validateObjectId('postId'), getPostDetails);
router.put('/update/:postId', verifyToken, validateObjectId('postId'), upload.array('files', 5), updatePost);
router.delete('/delete/:postId', verifyToken, validateObjectId('postId'), deletePost);
router.post("/bulkposts", bulkpostinsert);

module.exports = router;
