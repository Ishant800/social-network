const Blog = require('../models/blogs.model');
const Comment = require('../models/comment.model');
const User = require('../models/user.model');
const { cloudinary } = require('../config/cloudinary.config');

const createBlog = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      slug,
      body,
      summary,
      categoryName,
      categorySlug,
      tags,
      readTime,
      status,
      isFeatured,
      publishedAt,
    } = req.body;

    const user = await User.findById(userId).select('username profile.avatar');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let tagsArray = [];

if (req.body.tags) {
  if (Array.isArray(req.body.tags)) {
    tagsArray = req.body.tags;
  } else {
    tagsArray = [req.body.tags];
  }
}

    const blog = await Blog.create({
      author: {
        _id: user._id,
        username: user.username,
        avatar: user.profile?.avatar?.url || '',
      },
      title,
      slug,
      content: {
        body,
      },
      summary,
      coverImage: req.file
        ? {
            url: req.file.path,
            public_id: req.file.filename,
          }
        : undefined,
      category: {
        name: categoryName,
        slug: categorySlug,
      },
      tags: tagsArray,
      readTime,
      status: status || 'draft',
      isFeatured: isFeatured === true || isFeatured === 'true',
      publishedAt: publishedAt || undefined,
    });

    await User.findByIdAndUpdate(userId, { $inc: { 'stats.blogs': 1 } });

    return res.status(201).json({
      success: true,
      message: 'blog created successfully',
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyBlogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const blogs = await Blog.find({ 'author._id': userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalCount: blogs.length,
      blogs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBlogDetails = async (req, res) => {
  try {
    const blogId = req.params.blogId;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'blog not found',
      });
    }

    const comments = await Comment.find({
      'target.type': 'Blog',
      'target.id': blogId,
      parentComment: null,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      blog,
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBlog = async (req, res) => {
  try {
    const userId = req.user.id;
    const blogId = req.params.blogId;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'blog not found',
      });
    }

    if (blog.author._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this blog',
      });
    }

    if (req.body.title) blog.title = req.body.title;
    if (req.body.slug) blog.slug = req.body.slug;
    if (req.body.body) blog.content.body = req.body.body;
    if (req.body.summary) blog.summary = req.body.summary;
    if (req.body.categoryName) blog.category.name = req.body.categoryName;
    if (req.body.categorySlug) blog.category.slug = req.body.categorySlug;
    if (req.body.readTime) blog.readTime = req.body.readTime;
    if (req.body.status) blog.status = req.body.status;
    if (req.body.isFeatured !== undefined) {
      blog.isFeatured = req.body.isFeatured === true || req.body.isFeatured === 'true';
    }
    if (req.body.publishedAt) blog.publishedAt = req.body.publishedAt;

    if (req.body.tags) {
      if (Array.isArray(req.body.tags)) {
        blog.tags = req.body.tags;
      } else {
        blog.tags = req.body.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);
      }
    }

    if (req.file) {
      if (blog.coverImage?.public_id) {
        await cloudinary.uploader.destroy(blog.coverImage.public_id);
      }

      blog.coverImage = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message: 'blog updated successfully',
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const randomBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      blogs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBlog,
  getMyBlogs,
  getBlogDetails,
  updateBlog,
  randomBlogs,
};
