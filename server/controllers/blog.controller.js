const mongoose = require('mongoose');
const Blog = require('../models/blogs.model');
const User = require('../models/user.model');
const { cloudinary } = require('../config/cloudinary.config');

// ============ HELPER FUNCTIONS ============

const slugify = (value = '') => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const splitTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(tag => tag.trim()).filter(Boolean);
  return tags.split(',').map(tag => tag.trim()).filter(Boolean);
};

const calculateReadTime = (body = '') => {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const generateUniqueSlug = async (title, excludeBlogId = null) => {
  let slug = slugify(title);
  let suffix = 1;
  
  while (await Blog.findOne({ slug, _id: { $ne: excludeBlogId } })) {
    slug = `${slugify(title)}-${suffix}`;
    suffix++;
  }
  return slug;
};

// ============ CONTROLLERS ============

// Create Blog
const createBlog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, body, summary, categoryName, tags, status, isFeatured } = req.body;

    if (!title?.trim() || !body?.trim()) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const slug = await generateUniqueSlug(title);
    const normalizedStatus = status === 'published' ? 'published' : 'draft';

    // Create blog with author reference
    const blogData = {
      author: userId,
      title: title.trim(),
      slug,
      content: { body: body.trim() },
      summary: summary?.trim() || '',
      coverImage: req.file ? { url: req.file.path, public_id: req.file.filename } : undefined,
      category: categoryName?.trim() ? { name: categoryName.trim(), slug: slugify(categoryName) } : undefined,
      tags: splitTags(tags),
      readTime: calculateReadTime(body),
      status: normalizedStatus,
      isFeatured: isFeatured === true || isFeatured === 'true',
      publishedAt: normalizedStatus === 'published' ? new Date() : null
    };

    const blog = await Blog.create(blogData);

    // Update user stats
    await User.findByIdAndUpdate(userId, { $inc: { 'stats.blogs': 1 } });

    // Get populated blog for response
    const populatedBlog = await Blog.findById(blog._id)
      .populate('author', 'username profile.avatar profile.fullName')
      .lean();

    return res.status(201).json({ 
      success: true, 
      message: 'Blog created successfully', 
      blog: populatedBlog 
    });
  } catch (error) {
    console.error('Create blog error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create blog'
    });
  }
};

// Get My Blogs
const getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .populate('author', 'username profile.avatar profile.fullName')
      .lean();
    
    return res.status(200).json({ success: true, blogs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Explore Published Blogs
const explorePublishedBlogs = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const skip = parseInt(req.query.skip) || 0;
    const search = req.query.search?.trim();
    const category = req.query.category?.trim();

    const query = { status: 'published' };
    
    if (category) query['category.name'] = { $regex: category, $options: 'i' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'username profile.avatar profile.fullName')
        .lean(),
      Blog.countDocuments(query)
    ]);

    return res.status(200).json({ success: true, blogs, total, hasMore: skip + blogs.length < total });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Blog
const getBlogDetails = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId)
      .populate('author', 'username profile.avatar profile.fullName')
      .lean();
    
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    // Increment views
    await Blog.findByIdAndUpdate(req.params.blogId, { $inc: { 'stats.views': 1 } });
    blog.stats = { ...blog.stats, views: (blog.stats?.views || 0) + 1 };

    return res.status(200).json({ success: true, blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Blog
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { title, body, summary, categoryName, tags, status, isFeatured } = req.body;

    if (title !== undefined) {
      blog.title = title.trim();
      blog.slug = await generateUniqueSlug(title, blog._id);
    }
    if (body !== undefined) {
      blog.content.body = body.trim();
      blog.readTime = calculateReadTime(body);
    }
    if (summary !== undefined) blog.summary = summary.trim() || '';
    if (categoryName !== undefined) {
      blog.category = categoryName.trim() ? { name: categoryName.trim(), slug: slugify(categoryName) } : undefined;
    }
    if (tags !== undefined) blog.tags = splitTags(tags);
    if (status !== undefined) blog.status = status === 'published' ? 'published' : 'draft';
    if (isFeatured !== undefined) blog.isFeatured = isFeatured === true || isFeatured === 'true';

    if (req.file) {
      if (blog.coverImage?.public_id) await cloudinary.uploader.destroy(blog.coverImage.public_id);
      blog.coverImage = { url: req.file.path, public_id: req.file.filename };
    }

    await blog.save();
    
    const updatedBlog = await Blog.findById(blog._id)
      .populate('author', 'username profile.avatar profile.fullName')
      .lean();
    
    return res.status(200).json({ success: true, message: 'Blog updated successfully', blog: updatedBlog });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Blog
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (blog.coverImage?.public_id) await cloudinary.uploader.destroy(blog.coverImage.public_id);
    await blog.deleteOne();
    await User.findByIdAndUpdate(req.user.id, { $inc: { 'stats.blogs': -1 } });

    return res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBlog,
  getMyBlogs,
  getBlogDetails,
  updateBlog,
  deleteBlog,
  explorePublishedBlogs
};