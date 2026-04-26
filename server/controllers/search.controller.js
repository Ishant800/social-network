const User = require('../models/user.model');
const Post = require('../models/post.model');
const Blog = require('../models/blogs.model');

const search = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const query = q.trim().toLowerCase();

    // Search users by username (case-insensitive)
    const users = await User.find({
      username: { $regex: query, $options: 'i' }
    })
      .select('username profile.fullName profile.avatar followers')
      .limit(10)
      .lean();

    // Search posts by tags
    const posts = await Post.find({
      tags: { $regex: query, $options: 'i' },
      isPublic: true
    })
      .populate('user', 'username profile.fullName profile.avatar')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Search blogs by category name
    const blogs = await Blog.find({
      'category.name': { $regex: query, $options: 'i' },
      status: 'published'
    })
      .populate('author', 'username profile.fullName profile.avatar')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      query,
      results: {
        users,
        posts,
        blogs
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { search };
