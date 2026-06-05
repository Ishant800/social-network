const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const Post = require('../models/post.model');
const Blog = require('../models/blogs.model');

const INTEREST_CATEGORIES = [
  'Programming',
  'AI',
  'Technology',
  'Business',
  'Startups',
  'Finance',
  'Science',
  'Education',
  'Gaming',
  'Sports',
  'Movies',
  'Music',
  'Travel',
  'Lifestyle',
  'Health',
  'Politics'
];

const bulkInsertUser = async (req, res) => {
try {
const users = req.body;

if (!Array.isArray(users) || users.length === 0) {
  return res.status(400).json({
    success: false,
    message: "Request body must be a non-empty array"
  });
}

const preparedUsers = await Promise.all(
  users.map(async (user) => {

    const interestScores = {};

    if (
      user.preferences?.interests &&
      Array.isArray(user.preferences.interests)
    ) {
      user.preferences.interests.forEach((interest) => {
        interestScores[interest] = 50;
      });
    }

    const hashedPassword = await bcrypt.hash(
      user.password,
      10
    );

    return {
      username: user.username,
      email: user.email,
      password: hashedPassword,

      profile: user.profile || {},

      preferences: user.preferences || {
        interests: []
      },

      interestScores,

      stats: {
        posts: 0,
        blogs: 0,
        followers: 0,
        following: 0
      }
    };
  })
);

const insertedUsers =
  await User.insertMany(preparedUsers, {
    ordered: false
  });

return res.status(201).json({
  success: true,
  count: insertedUsers.length,
  message: "Users inserted successfully"
});

} catch (error) {
console.error(error);

return res.status(500).json({
  success: false,
  message: error.message
});

}
};

const bulkInsertPost = async (req, res) => {
  try {
    const { author, content, category, tags, media, visibility } = req.body;

    // Validation
    if (!author || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'author, content, and category are required'
      });
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'tags must be a non-empty array'
      });
    }

    // Verify author exists
    const userExists = await User.findById(author);
    if (!userExists) {
      return res.status(400).json({
        success: false,
        message: 'Author user ID does not exist'
      });
    }

    // Create post object
    const newPost = new Post({
      author,
      content,
      category,
      tags,
      media: media || [],
      visibility: visibility || 'public',
      status: 'active',
      reactions: {
        like: 0,
        love: 0,
        haha: 0,
        wow: 0,
        sad: 0,
        angry: 0
      },
      stats: {
        views: 0,
        comments: 0,
        bookmarks: 0,
        shares: 0
      },
      engagementScore: 0
    });

    // Save to database
    const savedPost = await newPost.save();

    // Update user post count
    await User.findByIdAndUpdate(author, {
      $inc: { 'stats.posts': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Post inserted successfully',
      data: {
        _id: savedPost._id,
        author: savedPost.author,
        content: savedPost.content,
        category: savedPost.category,
        tags: savedPost.tags,
        engagementScore: savedPost.engagementScore
      }
    });
  } catch (error) {
    console.error('Bulk insert post error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ====================================
// BULK INSERT BLOG - MANUAL INPUT
// ====================================
/**
 * POST /api/bulk/blog
 * Insert a single blog with manual input from Postman
 * Body: { author, title, content, category, tags, summary, readTime, ... }
 */
const bulkInsertBlog = async (req, res) => {
  try {
    const { author, title, content, category, tags, summary, readTime, coverImage } = req.body;

    // Validation
    if (!author || !title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'author, title, content, and category are required'
      });
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'tags must be a non-empty array'
      });
    }

    // Verify author exists
    const userExists = await User.findById(author);
    if (!userExists) {
      return res.status(400).json({
        success: false,
        message: 'Author user ID does not exist'
      });
    }
    
    // Generate unique slug
    const slug = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    // Create blog object
    const newBlog = new Blog({
      author,
      title,
      slug,
      content,
      category,
      tags,
      summary: summary || '',
      coverImage: coverImage || {},
      readTime: readTime || 5,
      status: 'published',
      publishedAt: new Date(),
      stats: {
        views: 0,
        likes: 0,
        comments: 0,
        bookmarks: 0,
        shares: 0
      },
      engagementScore: 0
    });

    // Save to database
    const savedBlog = await newBlog.save();

    // Update user blog count
    await User.findByIdAndUpdate(author, {
      $inc: { 'stats.blogs': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Blog inserted successfully',
      data: {
        _id: savedBlog._id,
        author: savedBlog.author,
        title: savedBlog.title,
        category: savedBlog.category,
        tags: savedBlog.tags,
        engagementScore: savedBlog.engagementScore
      }
    });
  } catch (error) {
    console.error('Bulk insert blog error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ====================================
// GET BULK DATA STATS
// ====================================
/**
 * GET /api/bulk/stats
 * Get current database statistics
 */
const getBulkDataStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const blogCount = await Blog.countDocuments();

    const stats = {
      users: userCount,
      posts: postCount,
      blogs: blogCount,
      total: userCount + postCount + blogCount
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ====================================
// CLEAR ALL DATA
// ====================================
/**
 * DELETE /api/bulk/clear-all
 * Clear all data from database (DESTRUCTIVE)
 */
const clearAllData = async (req, res) => {
  try {
    const { confirm } = req.body;

    if (confirm !== true) {
      return res.status(400).json({
        success: false,
        message: 'Please confirm deletion by sending { "confirm": true }'
      });
    }

    await User.deleteMany({});
    await Post.deleteMany({});
    await Blog.deleteMany({});

    res.status(200).json({
      success: true,
      message: 'All data cleared successfully'
    });
  } catch (error) {
    console.error('Clear data error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  bulkInsertUser,
  bulkInsertPost,
  bulkInsertBlog,
  getBulkDataStats,
  clearAllData
};
