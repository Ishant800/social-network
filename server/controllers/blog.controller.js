const mongoose = require('mongoose');
const Blog = require('../models/blogs.model');
const BlogLike = require('../models/blog-like.model');
const User = require('../models/user.model');
const Message = require('../models/message.model');
const { cloudinary } = require('../config/cloudinary.config');

const POPULATE_AUTHOR = 'username profile.avatar profile.fullName';

const slugify = (value = '') => {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const splitTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags
      .flatMap((tag) => String(tag).split(','))
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return String(tags)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const stripHtml = (value = '') => {
  return String(value).replace(/<[^>]*>/g, ' ');
};

const extractTextFromContent = (content) => {
  if (!content) return '';
  if (typeof content === 'string') return stripHtml(content);
  if (Array.isArray(content)) return content.map(extractTextFromContent).join(' ');
  if (typeof content !== 'object') return String(content);

  if (typeof content.text === 'string') return content.text;
  if (typeof content.body === 'string') return stripHtml(content.body);
  if (Array.isArray(content.content)) return extractTextFromContent(content.content);

  return Object.values(content).map(extractTextFromContent).join(' ');
};

const calculateReadTime = (content) => {
  const words = extractTextFromContent(content).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const normalizeContent = ({ content, body }) => {
  const parseJsonContent = (value) => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return null;
    }
    return null;
  };

  if (content && typeof content === 'object' && !Array.isArray(content)) {
    return content;
  }

  const parsedContent = parseJsonContent(content);
  if (parsedContent) return parsedContent;

  if (typeof content === 'string' && content.trim()) {
    return { body: content.trim() };
  }

  const parsedBody = parseJsonContent(body);
  if (parsedBody) return parsedBody;

  if (typeof body === 'string' && body.trim()) {
    return { body: body.trim() };
  }

  return null;
};

const normalizeStatus = (status) => {
  if (status === undefined || status === null || status === '') return undefined;
  if (status === 'draft' || status === 'published') return status;
  return null;
};

const generateUniqueSlug = async (title, excludeBlogId = null) => {
  const baseSlug = slugify(title) || 'blog';
  let slug = baseSlug;
  let suffix = 1;

  while (await Blog.findOne({ slug, _id: { $ne: excludeBlogId } }).select('_id').lean()) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

const getAuthenticatedUserId = (req) => req.user?.id || req.user?._id;

const buildCoverImage = (file) => {
  if (!file) return undefined;
  return {
    url: file.path || file.secure_url || file.url,
    public_id: file.filename || file.public_id,
  };
};

const findBlogByParam = (blogId) => {
  const query = mongoose.Types.ObjectId.isValid(blogId)
    ? { _id: blogId }
    : { slug: blogId };

  return Blog.findOne(query);
};

const populateBlog = (blogId) => {
  return Blog.findById(blogId).populate('author', POPULATE_AUTHOR).lean();
};

const createBlog = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const {
      title,
      summary,
      category,
      categoryName,
      tags,
      status,
      content,
      body,
    } = req.body;

    const normalizedTitle = String(title || '').trim();
    const normalizedContent = normalizeContent({ content, body });

    if (!normalizedTitle || !normalizedContent) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    const normalizedStatus = normalizeStatus(status);
    if (status !== undefined && !normalizedStatus) {
      return res.status(400).json({
        success: false,
        message: 'Status must be draft or published',
      });
    }

    const blog = await Blog.create({
      author: userId,
      title: normalizedTitle,
      slug: await generateUniqueSlug(normalizedTitle),
      summary: String(summary || '').trim(),
      coverImage: buildCoverImage(req.file),
      category: String(category || categoryName || '').trim(),
      tags: splitTags(tags),
      content: normalizedContent,
      readTime: calculateReadTime(normalizedContent),
      status: normalizedStatus || 'draft',
      publishedAt: normalizedStatus === 'published' ? new Date() : null,
    });

    await User.findByIdAndUpdate(userId, { $inc: { 'stats.blogs': 1 } });

    return res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      blog: await populateBlog(blog._id),
    });
  } catch (error) {
    console.error('Create blog error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create blog',
    });
  }
};

const getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: getAuthenticatedUserId(req) })
      .sort({ createdAt: -1 })
      .populate('author', POPULATE_AUTHOR)
      .lean();

    return res.status(200).json({ success: true, blogs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const explorePublishedBlogs = async (req, res) => {
  try {
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 12, 50);
    const skip = Math.max(Number.parseInt(req.query.skip, 10) || 0, 0);
    const search = String(req.query.search || '').trim();
    const category = String(req.query.category || '').trim();

    const query = { status: 'published' };

    if (category) query.category = { $regex: category, $options: 'i' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', POPULATE_AUTHOR)
        .lean(),
      Blog.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      blogs,
      total,
      hasMore: skip + blogs.length < total,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBlogDetails = async (req, res) => {
  try {
    const blog = await findBlogByParam(req.params.blogId)
      .populate('author', POPULATE_AUTHOR)
      .lean();

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    await Blog.findByIdAndUpdate(blog._id, { $inc: { 'stats.views': 1 } });
    blog.stats = { ...blog.stats, views: (blog.stats?.views || 0) + 1 };

    const userId = req.user?.id || req.user?._id;
    let isLiked = false;
    if (userId) {
      isLiked = !!(await BlogLike.findOne({ userId, blogId: blog._id }).select('_id').lean());
    }

    blog.isLiked = isLiked;
    blog.likesCount = blog.stats?.likes || 0;
    blog.commentsCount = blog.stats?.comments || 0;

    return res.status(200).json({ success: true, blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const blog = await findBlogByParam(req.params.blogId);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (String(blog.author) !== String(getAuthenticatedUserId(req))) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const {
      title,
      summary,
      category,
      categoryName,
      tags,
      status,
      content,
      body,
    } = req.body;

    if (title !== undefined) {
      const normalizedTitle = String(title).trim();
      if (!normalizedTitle) {
        return res.status(400).json({ success: false, message: 'Title is required' });
      }

      blog.title = normalizedTitle;
      blog.slug = await generateUniqueSlug(normalizedTitle, blog._id);
    }

    const normalizedContent = normalizeContent({ content, body });
    if (content !== undefined || body !== undefined) {
      if (!normalizedContent) {
        return res.status(400).json({ success: false, message: 'Content is required' });
      }

      blog.content = normalizedContent;
      blog.readTime = calculateReadTime(normalizedContent);
    }

    if (summary !== undefined) {
      blog.summary = String(summary).trim();
    }

    if (category !== undefined || categoryName !== undefined) {
      blog.category = String(category || categoryName || '').trim();
    }

    if (tags !== undefined) {
      blog.tags = splitTags(tags);
    }

    if (status !== undefined) {
      const normalizedStatus = normalizeStatus(status);
      if (!normalizedStatus) {
        return res.status(400).json({
          success: false,
          message: 'Status must be draft or published',
        });
      }

      const wasPublished = blog.status === 'published';
      blog.status = normalizedStatus;
      if (normalizedStatus === 'published' && !wasPublished) {
        blog.publishedAt = new Date();
      }
      if (normalizedStatus === 'draft') {
        blog.publishedAt = null;
      }
    }

    if (req.file) {
      if (blog.coverImage?.public_id) {
        await cloudinary.uploader.destroy(blog.coverImage.public_id);
      }
      blog.coverImage = buildCoverImage(req.file);
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      blog: await populateBlog(blog._id),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await findBlogByParam(req.params.blogId);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (String(blog.author) !== String(getAuthenticatedUserId(req))) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (blog.coverImage?.public_id) {
      await cloudinary.uploader.destroy(blog.coverImage.public_id);
    }

    await blog.deleteOne();
    await User.findByIdAndUpdate(getAuthenticatedUserId(req), { $inc: { 'stats.blogs': -1 } });

    return res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getActiveDiscussions = async (req, res) => {
  try {
    const hours = Math.min(Math.max(parseInt(req.query.hours, 10) || 168, 1), 720);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 20);
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const activity = await Message.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$blogId',
          messageCount: { $sum: 1 },
          lastActivity: { $max: '$createdAt' },
          participants: { $addToSet: '$user._id' },
        },
      },
      { $sort: { lastActivity: -1 } },
      { $limit: limit * 3 },
    ]);

    const activityByBlogId = new Map(activity.map((item) => [String(item._id), item]));
    const blogIds = activity
      .map((item) => String(item._id))
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (blogIds.length === 0) {
      return res.status(200).json({ success: true, discussions: [] });
    }

    const blogs = await Blog.find({
      _id: { $in: blogIds },
      status: 'published',
    })
      .select('_id title slug author createdAt')
      .populate('author', POPULATE_AUTHOR)
      .lean();

    const discussions = blogs
      .map((blog) => {
        const active = activityByBlogId.get(String(blog._id));
        return {
          blogId: blog._id,
          title: blog.title,
          slug: blog.slug,
          author: {
            _id: blog.author?._id,
            username: blog.author?.username,
            avatar: blog.author?.profile?.avatar,
            fullName: blog.author?.profile?.fullName,
          },
          participantCount: active?.participants?.length || 0,
          messageCount: active?.messageCount || 0,
          lastActivity: active?.lastActivity || blog.createdAt,
        };
      })
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
      .slice(0, limit);

    return res.status(200).json({ success: true, discussions });
  } catch (error) {
    console.error('Get active discussions error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch active discussions',
    });
  }
};

module.exports = {
  createBlog,
  getMyBlogs,
  getBlogDetails,
  updateBlog,
  deleteBlog,
  explorePublishedBlogs,
  getActiveDiscussions,
};
