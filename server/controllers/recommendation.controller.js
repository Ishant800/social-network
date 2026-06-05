const mongoose = require('mongoose');
const Post = require('../models/post.model');
const Blog = require('../models/blogs.model');
const User = require('../models/user.model');
const UserInteraction = require('../models/userinteractions.model');

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

const INITIAL_INTEREST_SCORE = 50;

// ====================================
// INTEREST SCORE UPDATE LOGIC
// ====================================

/**
 * Calculate score increment based on action type
 */
const getScoreIncrement = (action, reactionType = null) => {
  const scoreMap = {
    view: { category: 1, tag: 1 },
    react_like: { category: 5, tag: 5 },
    react_love: { category: 8, tag: 8 },
    react_haha: { category: 4, tag: 4 },
    react_wow: { category: 6, tag: 6 },
    react_sad: { category: 2, tag: 2 },
    react_angry: { category: 2, tag: 2 },
    comment: { category: 10, tag: 10 },
    bookmark: { category: 15, tag: 15 },
    share: { category: 20, tag: 20 },
    read_25: { category: 5, tag: 5 },
    read_50: { category: 10, tag: 10 },
    read_75: { category: 15, tag: 15 },
    read_100: { category: 25, tag: 25 }
  };

  if (action === 'react' && reactionType) {
    return scoreMap[`react_${reactionType}`] || scoreMap.view;
  }

  return scoreMap[action] || scoreMap.view;
};

/**
 * Update user interest scores based on interaction
 */
const updateInterestScores = async (userId, category, tags, action, reactionType = null) => {
  try {
    const increment = getScoreIncrement(action, reactionType);
    
    const updateObj = {};

    // Update category score
    if (category) {
      const categoryKey = `interestScores.${category}`;
      updateObj[categoryKey] = increment.category;
    }

    // Update tag scores
    if (tags && tags.length > 0) {
      tags.forEach(tag => {
        const tagKey = `interestScores.${tag}`;
        updateObj[tagKey] = increment.tag;
      });
    }

    if (Object.keys(updateObj).length > 0) {
      await User.findByIdAndUpdate(
        userId,
        { $inc: updateObj },
        { new: true }
      );
    }
  } catch (error) {
    console.error('Error updating interest scores:', error);
  }
};

/**
 * Create user interaction record
 */
const createUserInteraction = async (
  userId,
  contentType,
  contentId,
  action,
  category,
  tags,
  reactionType = null,
  readPercentage = 0
) => {
  try {
    const interaction = new UserInteraction({
      user: userId,
      contentType,
      contentId,
      action,
      category,
      tags,
      reactionType,
      readPercentage
    });

    await interaction.save();
    return interaction;
  } catch (error) {
    console.error('Error creating user interaction:', error);
  }
};

// ====================================
// ENGAGEMENT SCORE CALCULATION
// ====================================

/**
 * Calculate engagement score for post
 * Formula: (like × 1) + (love × 2) + (haha × 1.5) + (wow × 2) + (sad × 1) + 
 *          (angry × 1) + (comments × 3) + (bookmarks × 5) + (shares × 7)
 */
const calculatePostEngagementScore = (post) => {
  if (!post || !post.reactions) return 0;

  const score =
    (post.reactions.like || 0) * 1 +
    (post.reactions.love || 0) * 2 +
    (post.reactions.haha || 0) * 1.5 +
    (post.reactions.wow || 0) * 2 +
    (post.reactions.sad || 0) * 1 +
    (post.reactions.angry || 0) * 1 +
    (post.stats?.comments || 0) * 3 +
    (post.stats?.bookmarks || 0) * 5 +
    (post.stats?.shares || 0) * 7;

  return Math.round(score);
};

/**
 * Calculate engagement score for blog
 * Formula: likes + (comments × 3) + (bookmarks × 5) + (shares × 7)
 */
const calculateBlogEngagementScore = (blog) => {
  if (!blog || !blog.stats) return 0;

  const score =
    (blog.stats.likes || 0) +
    (blog.stats.comments || 0) * 3 +
    (blog.stats.bookmarks || 0) * 5 +
    (blog.stats.shares || 0) * 7;

  return Math.round(score);
};

/**
 * Update engagement score in database
 */
const updateEngagementScore = async (contentType, contentId) => {
  try {
    const Model = contentType === 'post' ? Post : Blog;
    const content = await Model.findById(contentId);

    if (!content) return;

    const score =
      contentType === 'post'
        ? calculatePostEngagementScore(content)
        : calculateBlogEngagementScore(content);

    await Model.findByIdAndUpdate(
      contentId,
      { engagementScore: score },
      { new: true }
    );
  } catch (error) {
    console.error('Error updating engagement score:', error);
  }
};

// ====================================
// FRESHNESS SCORE CALCULATION
// ====================================

/**
 * Calculate freshness score based on content age
 * 0-1 hour: +50
 * 1-6 hours: +30
 * 6-24 hours: +20
 * 1-3 days: +10
 * >3 days: 0
 */
const calculateFreshnessScore = (createdAt) => {
  const now = Date.now();
  const contentAge = now - new Date(createdAt).getTime();

  const oneHour = 60 * 60 * 1000;
  const sixHours = 6 * oneHour;
  const oneDay = 24 * oneHour;
  const threeDays = 3 * oneDay;

  if (contentAge <= oneHour) return 50;
  if (contentAge <= sixHours) return 30;
  if (contentAge <= oneDay) return 20;
  if (contentAge <= threeDays) return 10;
  return 0;
};

// ====================================
// INTEREST MATCHING SCORE
// ====================================

/**
 * Calculate interest match score
 * For each matching category: + user.interestScores[category]
 * For each matching tag: + user.interestScores[tag]
 */
const calculateInterestMatchScore = (user, category, tags) => {
  if (!user.interestScores) return 0;

  let score = 0;

  // Category match
  if (category && user.interestScores.has(category)) {
    score += user.interestScores.get(category);
  }

  // Tag matches
  if (tags && tags.length > 0) {
    tags.forEach(tag => {
      if (user.interestScores.has(tag)) {
        score += user.interestScores.get(tag);
      }
    });
  }

  return score;
};

// ====================================
// FOLLOWING BONUS
// ====================================

/**
 * Calculate following bonus
 * If content author is followed by current user: +100
 */
const calculateFollowingBonus = (userId, authorId, userFollowing) => {
  if (userFollowing && userFollowing.includes(authorId.toString())) {
    return 100;
  }
  return 0;
};

// ====================================
// FINAL RANKING SCORE
// ====================================

/**
 * Calculate final feed ranking score
 * Formula: Interest Match Score + Following Bonus + Engagement Score + Freshness Score
 */
const calculateFinalScore = (
  user,
  content,
  isFollowing,
  contentType
) => {
  const interestScore = calculateInterestMatchScore(
    user,
    content.category,
    content.tags
  );

  const followingBonus = calculateFollowingBonus(
    user._id,
    content.author || content.userId,
    user.following
  );

  const engagementScore = content.engagementScore || 0;
  const freshnessScore = calculateFreshnessScore(content.createdAt);

  const finalScore = interestScore + followingBonus + engagementScore + freshnessScore;

  return {
    finalScore,
    interestScore,
    followingBonus,
    engagementScore,
    freshnessScore
  };
};

// ====================================
// FEED GENERATION
// ====================================

/**
 * Get personalized feed for user
 * Combines: Following Content (40%) + Interest-Based Content (40%) + Trending Content (20%)
 */
const getPersonalizedFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Fetch user with all necessary data
    const user = await User.findById(userId).select(
      'interestScores following contentPreferences'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fetch more posts than needed for sorting
    const fetchLimit = limit * 4;

    // Get following content
    const followingContent = await Promise.all([
      Post.find({
        author: { $in: user.following },
        visibility: 'public',
        status: 'active'
      })
        .populate('author', 'username profile.fullName profile.avatar')
        .lean()
        .limit(fetchLimit),
      Blog.find({
        author: { $in: user.following },
        status: 'published'
      })
        .populate('author', 'username profile.fullName profile.avatar')
        .lean()
        .limit(fetchLimit)
    ]);

    // Get interest-based content
    const interestContent = await Promise.all([
      Post.find({
        category: { $in: user.preferences?.interests || [] },
        visibility: 'public',
        status: 'active',
        author: { $nin: user.following }
      })
        .populate('author', 'username profile.fullName profile.avatar')
        .lean()
        .limit(fetchLimit),
      Blog.find({
        category: { $in: user.preferences?.interests || [] },
        status: 'published',
        author: { $nin: user.following }
      })
        .populate('author', 'username profile.fullName profile.avatar')
        .lean()
        .limit(fetchLimit)
    ]);

    // Get trending content
    const trendingContent = await Promise.all([
      Post.find({
        visibility: 'public',
        status: 'active',
        author: { $nin: user.following }
      })
        .sort({ engagementScore: -1, createdAt: -1 })
        .populate('author', 'username profile.fullName profile.avatar')
        .lean()
        .limit(fetchLimit),
      Blog.find({
        status: 'published',
        author: { $nin: user.following }
      })
        .sort({ engagementScore: -1, createdAt: -1 })
        .populate('author', 'username profile.fullName profile.avatar')
        .lean()
        .limit(fetchLimit)
    ]);

    // Combine and score content
    const scoredContent = [];

    // Score following content (40% preference)
    [...followingContent[0], ...followingContent[1]].forEach(content => {
      const scores = calculateFinalScore(
        user,
        content,
        true,
        content.author ? 'blog' : 'post'
      );
      scoredContent.push({
        ...content,
        contentType: content.author ? 'blog' : 'post',
        ...scores,
        feedSection: 'following'
      });
    });

    // Score interest-based content (40% preference)
    [...interestContent[0], ...interestContent[1]].forEach(content => {
      const scores = calculateFinalScore(
        user,
        content,
        false,
        content.author ? 'blog' : 'post'
      );
      scoredContent.push({
        ...content,
        contentType: content.author ? 'blog' : 'post',
        ...scores,
        feedSection: 'interest'
      });
    });

    // Score trending content (20% preference)
    [...trendingContent[0], ...trendingContent[1]].forEach(content => {
      const scores = calculateFinalScore(
        user,
        content,
        false,
        content.author ? 'blog' : 'post'
      );
      scoredContent.push({
        ...content,
        contentType: content.author ? 'blog' : 'post',
        ...scores,
        feedSection: 'trending'
      });
    });

    // Sort by final score descending
    scoredContent.sort((a, b) => b.finalScore - a.finalScore);

    // Apply content preferences
    const { posts: postPreference = 50, blogs: blogPreference = 50 } = user.contentPreferences;

    // Filter to respect content preferences
    const filteredContent = scoredContent.filter(item => {
      if (item.contentType === 'post') {
        return Math.random() * 100 <= postPreference;
      } else {
        return Math.random() * 100 <= blogPreference;
      }
    });

    // Apply pagination
    const paginatedContent = filteredContent.slice(skip, skip + limit);

    // Format response
    const formattedContent = paginatedContent.map(item => {
      if (item.contentType === 'blog') {
        return {
          _id: item._id,
          type: 'blog',
          title: item.title,
          summary: item.summary,
          category: item.category,
          tags: item.tags,
          coverImage: item.coverImage,
          engagementScore: item.engagementScore,
          stats: item.stats,
          readTime: item.readTime,
          createdAt: item.createdAt,
          author: {
            _id: item.author._id,
            username: item.author.username,
            fullName: item.author.profile?.fullName,
            avatar: item.author.profile?.avatar
          },
          score: item.finalScore
        };
      } else {
        return {
          _id: item._id,
          type: 'post',
          content: item.content,
          media: item.media,
          category: item.category,
          tags: item.tags,
          engagementScore: item.engagementScore,
          reactions: item.reactions,
          stats: item.stats,
          createdAt: item.createdAt,
          author: {
            _id: item.author._id,
            username: item.author.username,
            fullName: item.author.profile?.fullName,
            avatar: item.author.profile?.avatar
          },
          score: item.finalScore
        };
      }
    });

    res.status(200).json({
      success: true,
      data: formattedContent,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredContent.length
      }
    });
  } catch (error) {
    console.error('Get personalized feed error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ====================================
// INTERACTION TRACKING
// ====================================

/**
 * Track user view interaction
 */
const trackView = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contentType, contentId } = req.body;

    // Get content to extract category and tags
    const Model = contentType === 'post' ? Post : Blog;
    const content = await Model.findById(contentId);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Create interaction record
    await createUserInteraction(
      userId,
      contentType,
      contentId,
      'view',
      content.category,
      content.tags
    );

    // Update interest scores
    await updateInterestScores(
      userId,
      content.category,
      content.tags,
      'view'
    );

    res.status(201).json({
      success: true,
      message: 'View tracked successfully'
    });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Track user reaction interaction
 */
const trackReaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contentType, contentId, reactionType } = req.body;

    // Validate reaction type
    if (!['like', 'love', 'haha', 'wow', 'sad', 'angry'].includes(reactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reaction type'
      });
    }

    // Get content
    const Model = contentType === 'post' ? Post : Blog;
    const content = await Model.findById(contentId);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Create interaction record
    await createUserInteraction(
      userId,
      contentType,
      contentId,
      'react',
      content.category,
      content.tags,
      reactionType
    );

    // Update interest scores
    await updateInterestScores(
      userId,
      content.category,
      content.tags,
      'react',
      reactionType
    );

    // Update engagement score
    await updateEngagementScore(contentType, contentId);

    res.status(201).json({
      success: true,
      message: 'Reaction tracked successfully'
    });
  } catch (error) {
    console.error('Track reaction error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Track user comment interaction
 */
const trackComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contentType, contentId } = req.body;

    // Get content
    const Model = contentType === 'post' ? Post : Blog;
    const content = await Model.findById(contentId);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Create interaction record
    await createUserInteraction(
      userId,
      contentType,
      contentId,
      'comment',
      content.category,
      content.tags
    );

    // Update interest scores
    await updateInterestScores(
      userId,
      content.category,
      content.tags,
      'comment'
    );

    // Update engagement score
    await updateEngagementScore(contentType, contentId);

    res.status(201).json({
      success: true,
      message: 'Comment tracked successfully'
    });
  } catch (error) {
    console.error('Track comment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Track user bookmark interaction
 */
const trackBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contentType, contentId } = req.body;

    // Get content
    const Model = contentType === 'post' ? Post : Blog;
    const content = await Model.findById(contentId);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Create interaction record
    await createUserInteraction(
      userId,
      contentType,
      contentId,
      'bookmark',
      content.category,
      content.tags
    );

    // Update interest scores
    await updateInterestScores(
      userId,
      content.category,
      content.tags,
      'bookmark'
    );

    // Update engagement score
    await updateEngagementScore(contentType, contentId);

    res.status(201).json({
      success: true,
      message: 'Bookmark tracked successfully'
    });
  } catch (error) {
    console.error('Track bookmark error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Track user share interaction
 */
const trackShare = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contentType, contentId } = req.body;

    // Get content
    const Model = contentType === 'post' ? Post : Blog;
    const content = await Model.findById(contentId);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Create interaction record
    await createUserInteraction(
      userId,
      contentType,
      contentId,
      'share',
      content.category,
      content.tags
    );

    // Update interest scores
    await updateInterestScores(
      userId,
      content.category,
      content.tags,
      'share'
    );

    // Update engagement score
    await updateEngagementScore(contentType, contentId);

    res.status(201).json({
      success: true,
      message: 'Share tracked successfully'
    });
  } catch (error) {
    console.error('Track share error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Track blog read progress
 */
const trackBlogRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contentId, readPercentage } = req.body;

    if (!readPercentage || readPercentage < 0 || readPercentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid read percentage'
      });
    }

    // Get blog
    const blog = await Blog.findById(contentId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Determine read action based on percentage
    let readAction = 'view';
    if (readPercentage >= 100) readAction = 'read_100';
    else if (readPercentage >= 75) readAction = 'read_75';
    else if (readPercentage >= 50) readAction = 'read_50';
    else if (readPercentage >= 25) readAction = 'read_25';

    // Create interaction record
    await createUserInteraction(
      userId,
      'blog',
      contentId,
      readAction,
      blog.category,
      blog.tags,
      null,
      readPercentage
    );

    // Update interest scores
    await updateInterestScores(
      userId,
      blog.category,
      blog.tags,
      readAction
    );

    // Update engagement score
    await updateEngagementScore('blog', contentId);

    res.status(201).json({
      success: true,
      message: 'Blog read tracked successfully'
    });
  } catch (error) {
    console.error('Track blog read error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ====================================
// EXPORTS
// ====================================

module.exports = {
  // Feed generation
  getPersonalizedFeed,

  // Interaction tracking
  trackView,
  trackReaction,
  trackComment,
  trackBookmark,
  trackShare,
  trackBlogRead,

  // Utility functions (for testing/debugging)
  calculatePostEngagementScore,
  calculateBlogEngagementScore,
  calculateFreshnessScore,
  calculateInterestMatchScore,
  calculateFollowingBonus,
  calculateFinalScore,
  updateEngagementScore,
  updateInterestScores,
  createUserInteraction,
  getScoreIncrement,

  // Constants
  INTEREST_CATEGORIES,
  INITIAL_INTEREST_SCORE
};
