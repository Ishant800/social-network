const Blog = require('../models/blogs.model');
const Comment = require('../models/comment.model');
const User = require('../models/user.model');
const { cloudinary } = require('../config/cloudinary.config');

const slugify = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

const splitTags = (tags) => {
  if (!tags) {
    return [];
  }

  if (Array.isArray(tags)) {
    return tags.map((tag) => tag.trim()).filter(Boolean);
  }

  return tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const calculateReadTime = (body = '') => {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const buildPublishedAt = (status, publishedAt, currentPublishedAt) => {
  if (publishedAt) {
    const parsedDate = new Date(publishedAt);
    return Number.isNaN(parsedDate.getTime()) ? currentPublishedAt : parsedDate;
  }

  if (status === 'published') {
    return currentPublishedAt || new Date();
  }

  return currentPublishedAt;
};

const generateUniqueSlug = async (title, excludeBlogId) => {
  const baseSlug = slugify(title) || `blog-${Date.now()}`;
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const existingBlog = await Blog.findOne({
      slug,
      ...(excludeBlogId ? { _id: { $ne: excludeBlogId } } : {}),
    }).select('_id');

    if (!existingBlog) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

const createBlog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, body, summary, categoryName, tags, status, isFeatured, publishedAt } = req.body;

    const trimmedTitle = title?.trim();
    const trimmedBody = body?.trim();
    const trimmedSummary = summary?.trim();
    const trimmedCategoryName = categoryName?.trim();
    const normalizedStatus = status === 'published' ? 'published' : 'draft';

    const user = await User.findById(userId).select('username profile.avatar');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!trimmedTitle || !trimmedBody) {
      return res.status(400).json({
        success: false,
        message: 'Title and article content are required',
      });
    }
    const slug = await generateUniqueSlug(trimmedTitle);
    const tagsArray = splitTags(tags);
    const readTime = calculateReadTime(trimmedBody);
    const categorySlug = slugify(trimmedCategoryName);

    const blog = await Blog.create({
      author: {
        _id: user._id,
        username: user.username,
        avatar: user.profile?.avatar?.url || '',
      },
      title: trimmedTitle,
      slug,
      content: {
        body: trimmedBody,
      },
      summary: trimmedSummary || undefined,
      coverImage: req.file
        ? {
            url: req.file.path,
            public_id: req.file.filename,
          }
        : undefined,
      category: {
        name: trimmedCategoryName || undefined,
        slug: categorySlug || undefined,
      },
      tags: tagsArray,
      readTime,
      status: normalizedStatus,
      isFeatured: isFeatured === true || isFeatured === 'true',
      publishedAt: buildPublishedAt(normalizedStatus, publishedAt),
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

    if (req.body.title !== undefined) {
      const trimmedTitle = req.body.title.trim();

      if (!trimmedTitle) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty',
        });
      }

      blog.title = trimmedTitle;
      blog.slug = await generateUniqueSlug(trimmedTitle, blog._id);
    }

    if (req.body.body !== undefined) {
      const trimmedBody = req.body.body.trim();

      if (!trimmedBody) {
        return res.status(400).json({
          success: false,
          message: 'Article content cannot be empty',
        });
      }

      blog.content.body = trimmedBody;
      blog.readTime = calculateReadTime(trimmedBody);
    }

    if (req.body.summary !== undefined) blog.summary = req.body.summary.trim() || undefined;
    if (req.body.categoryName !== undefined) {
      const trimmedCategoryName = req.body.categoryName.trim();
      blog.category.name = trimmedCategoryName || undefined;
      blog.category.slug = slugify(trimmedCategoryName) || undefined;
    }
    if (req.body.status) blog.status = req.body.status === 'published' ? 'published' : 'draft';
    if (req.body.isFeatured !== undefined) {
      blog.isFeatured = req.body.isFeatured === true || req.body.isFeatured === 'true';
    }
    blog.publishedAt = buildPublishedAt(blog.status, req.body.publishedAt, blog.publishedAt);

    if (req.body.tags !== undefined) {
      blog.tags = splitTags(req.body.tags);
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
