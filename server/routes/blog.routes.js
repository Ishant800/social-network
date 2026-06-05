const express = require('express');
const {
  createBlog,
  getMyBlogs,
  getBlogDetails,
  updateBlog,
  deleteBlog,
  explorePublishedBlogs,
  getActiveDiscussions,
} = require('../controllers/blog.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateObjectId } = require('../middleware/validateObjectId.middleware');
const { upload } = require('../config/cloudinary.config');

const router = express.Router();

router.post('/create', verifyToken, upload.single('coverImage'), createBlog);
router.get('/explore', verifyToken, explorePublishedBlogs);
router.get('/myBlogs', verifyToken, getMyBlogs);
router.get('/active-discussions', verifyToken, getActiveDiscussions);
router.get(
  '/blog-details/:blogId',
  verifyToken,
  validateObjectId('blogId'),
  getBlogDetails,
);
router.put(
  '/update/:blogId',
  verifyToken,
  validateObjectId('blogId'),
  upload.single('coverImage'),
  updateBlog,
);
router.delete(
  '/delete/:blogId',
  verifyToken,
  validateObjectId('blogId'),
  deleteBlog,
);

module.exports = router;
