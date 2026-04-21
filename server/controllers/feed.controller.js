const mongoose = require('mongoose');
const Post = require('../models/post.model');
const Blog = require('../models/blogs.model');
const User = require('../models/user.model');


function scoreContent(item, userFollowing = []) {
  let score = 0;

  // ✅ Recency (latest gets higher)
  const hoursOld = (Date.now() - new Date(item.createdAt)) / (1000 * 60 * 60);
  score += Math.max(0, 50 - hoursOld); // decay

  // ✅ Engagement
  score += (item.likesCount || 0) * 2;
  score += (item.commentsCount || 0) * 3;
  score += (item.views || 0) * 0.5;

  // ✅ Following boost
  if (userFollowing.includes(String(item.user?._id))) {
    score += 30;
  }

  return score;
}

// ===== MAIN FEED =====

async function getHomeFeed(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 15, 30);
    const userId = req.user?.id;

    let followingIds = [];

    if (userId) {
      const user = await User.findById(userId).select('following').lean();
      followingIds = user?.following?.map(id => String(id)) || [];
    }

    // ✅ Fetch data
    const [posts, blogs] = await Promise.all([
      Post.find({ isPublic: true })
        .sort({ createdAt: -1 })
        .limit(limit * 2)
        .populate('user', 'username profile.fullName profile.avatar')
        .lean(),

      Blog.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .limit(limit * 2)
        .populate('author', 'username avatar')
        .lean(),
    ]);

    // ✅ Normalize (minimal)
    const normalizedPosts = posts.map(p => ({
      ...p,
      feedType: 'post',
    }));

    const normalizedBlogs = blogs.map(b => ({
      ...b,
      feedType: 'blog',
      user: b.author
    }));

    // ✅ Merge
    let allItems = [...normalizedPosts, ...normalizedBlogs];

    // ✅ Score each item
    allItems = allItems.map(item => ({
      ...item,
      score: scoreContent(item, followingIds),
    }));

    // ✅ Sort by score (NOT just date)
    allItems.sort((a, b) => b.score - a.score);

    // ✅ Limit result
    const page = allItems.slice(0, limit);

    return res.status(200).json({
      success: true,
      items: page,
    });

  } catch (error) {
    console.error('Feed error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load feed',
    });
  }
}
module.exports = { 
  getHomeFeed 
  
};