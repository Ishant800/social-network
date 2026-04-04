const express = require('express');
const {
  createBlog,
  getMyBlogs,
  getBlogDetails,
  updateBlog,
  randomBlogs,
} = require('../controllers/blog.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary.config');

const router = express.Router();

router.post('/create', verifyToken, upload.single('coverImage'), createBlog);
router.get('/randomblogs', randomBlogs);
router.get('/myBlogs', verifyToken, getMyBlogs);
router.get('/blog-details/:blogId', verifyToken, getBlogDetails);
router.put('/update/:blogId', verifyToken, upload.single('coverImage'), updateBlog);

module.exports = router;
