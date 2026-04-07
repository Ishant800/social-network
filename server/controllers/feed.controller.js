const mongoose = require('mongoose');
const Post = require('../models/post.model');
const Blog = require('../models/blogs.model');
const User = require('../models/user.model');

// ============ HELPER FUNCTIONS ============

function normalizePostDoc(post) {
  const postData = { ...post };
  postData.id = postData._id;
  postData.feedType = 'post';
  
  if (postData.user) {
    postData.user.name = postData.user.profile?.fullName || postData.user.username;
    postData.user.profileImage = postData.user.profile?.avatar || null;
  }
  
  return postData;
}

function normalizeBlogDoc(blog) {
  return {
    _id: blog._id,
    id: blog._id,
    feedType: 'blog',
    title: blog.title,
    summary: blog.summary,
    content: blog.summary || blog.content?.body?.substring(0, 200) || '',
    coverImage: blog.coverImage,
    category: blog.category,
    tags: blog.tags || [],
    readTime: blog.readTime,
    stats: blog.stats || { views: 0, likes: 0, comments: 0 },
    status: blog.status,
    isFeatured: blog.isFeatured,
    publishedAt: blog.publishedAt,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
    user: {
      _id: blog.author?._id,
      username: blog.author?.username,
      name: blog.author?.username,
      profileImage: blog.author?.avatar ? { url: blog.author.avatar } : null,
    },
    media: blog.coverImage?.url ? [{ url: blog.coverImage.url }] : [],
    likesCount: blog.stats?.likes || 0,
    commentsCount: blog.stats?.comments || 0,
    views: blog.stats?.views || 0,
  };
}

function encodeCursor(item) {
  if (!item?._id || !item.createdAt) return null;
  const payload = {
    date: new Date(item.createdAt).toISOString(),
    id: String(item._id),
  };
  return Buffer.from(JSON.stringify(payload), 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function decodeCursor(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    let b64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const json = Buffer.from(b64, 'base64').toString('utf8');
    const payload = JSON.parse(json);
    if (!payload.date || !payload.id) return null;
    const date = new Date(payload.date);
    if (isNaN(date.getTime()) || !mongoose.Types.ObjectId.isValid(payload.id)) return null;
    return { date, id: new mongoose.Types.ObjectId(payload.id) };
  } catch {
    return null;
  }
}

function cursorFilter(cursor) {
  if (!cursor) return {};
  return {
    $or: [
      { createdAt: { $lt: cursor.date } },
      { createdAt: cursor.date, _id: { $lt: cursor.id } }
    ]
  };
}

// ============ MAIN FEED FUNCTION ============

async function getHomeFeed(req, res) {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 15, 1), 30);
    const cursor = decodeCursor(req.query.cursor);

    // Query filters
    const postQuery = { isPublic: true, ...cursorFilter(cursor) };
    const blogQuery = { status: 'published', ...cursorFilter(cursor) };

    // Fetch posts and blogs in parallel
    const [posts, blogs] = await Promise.all([
      Post.find(postQuery)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit)
        .populate('user', 'username profile.fullName profile.avatar')
        .lean(),
      Blog.find(blogQuery)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit)
        .populate('author', 'username avatar')
        .lean(),
    ]);

    // Normalize both types
    const normalizedPosts = posts.map(p => normalizePostDoc(p));
    const normalizedBlogs = blogs.map(b => normalizeBlogDoc(b));
    
    // Merge and sort by createdAt (newest first)
    const allItems = [...normalizedPosts, ...normalizedBlogs];
    allItems.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return String(b._id).localeCompare(String(a._id));
    });

    // Take only what we need
    const page = allItems.slice(0, limit);
    const lastItem = page[page.length - 1];
    const nextCursor = page.length === limit && lastItem ? encodeCursor(lastItem) : null;

    return res.status(200).json({
      success: true,
      items: page,
      nextCursor,
      hasMore: Boolean(nextCursor),
    });
  } catch (error) {
    console.error('Feed error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load feed',
    });
  }
}

// ============ GET SUGGESTIONS FOR USER ============

async function getFeedSuggestions(req, res) {
  try {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit) || 10, 20);

    // Get the current user's following list
    const currentUser = await User.findById(userId).select('following');
    const followingIds = currentUser?.following || [];

    // Exclude already followed users and self
    const excludeIds = [...followingIds, userId];

    // Find suggested users
    const suggestions = await User.find({
      _id: { $nin: excludeIds },
      'profile.isActive': { $ne: false }
    })
      .select('username profile.fullName profile.avatar profile.bio')
      .limit(limit)
      .lean();

    // Format suggestions
    const formattedSuggestions = suggestions.map(user => ({
      _id: user._id,
      username: user.username,
      name: user.profile?.fullName || user.username,
      avatar: user.profile?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=3b82f6&color=ffffff`,
      bio: user.profile?.bio || '',
      isFollowing: false
    }));

    return res.status(200).json({
      success: true,
      suggestions: formattedSuggestions,
      count: formattedSuggestions.length
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load suggestions'
    });
  }
}

// ============ GET TRENDING POSTS ============

async function getTrendingFeed(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 20);

    // Get trending posts (based on likes + comments + views in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [posts, blogs] = await Promise.all([
      Post.find({
        isPublic: true,
        createdAt: { $gte: sevenDaysAgo }
      })
        .sort({ likesCount: -1, commentsCount: -1, createdAt: -1 })
        .limit(limit)
        .populate('user', 'username profile.fullName profile.avatar')
        .lean(),
      Blog.find({
        status: 'published',
        publishedAt: { $gte: sevenDaysAgo }
      })
        .sort({ 'stats.likes': -1, 'stats.views': -1, publishedAt: -1 })
        .limit(limit)
        .populate('author', 'username avatar')
        .lean(),
    ]);

    const normalizedPosts = posts.map(p => normalizePostDoc(p));
    const normalizedBlogs = blogs.map(b => normalizeBlogDoc(b));
    
    const allItems = [...normalizedPosts, ...normalizedBlogs];
    
    // Sort by engagement score
    allItems.sort((a, b) => {
      const scoreA = (a.likesCount || 0) + (a.commentsCount || 0) + (a.views || 0);
      const scoreB = (b.likesCount || 0) + (b.commentsCount || 0) + (b.views || 0);
      return scoreB - scoreA;
    });

    return res.status(200).json({
      success: true,
      items: allItems.slice(0, limit),
      hasMore: false
    });
  } catch (error) {
    console.error('Trending error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load trending feed'
    });
  }
}

module.exports = { 
  getHomeFeed, 
  getFeedSuggestions,
  getTrendingFeed 
};