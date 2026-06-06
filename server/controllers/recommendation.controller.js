const mongoose = require('mongoose');
const Post = require('../models/post.model');
const Blog = require('../models/blogs.model');
const PostLike = require('../models/post-like.model');
const BlogLike = require('../models/blog-like.model');
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
  if (userFollowing?.some((id) => String(id) === String(authorId))) {
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

const getUserInterestKeys = (user) => {
  const fromScores = user.interestScores
    ? [...user.interestScores.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([key]) => key)
    : [];
  const fromPrefs = user.preferences?.interests || [];
  return [...new Set([...fromPrefs, ...fromScores])];
};

const scoreContentPool = (user, items, contentType) =>
  items
    .map((item) => {
      const scores = calculateFinalScore(user, item, false, contentType);
      return { ...item, ...scores, contentType };
    })
    .sort((a, b) => b.finalScore - a.finalScore);

const pickMixedFeed = (interestPool, followingPool, discoveryPool, limit) => {
  const interestTarget = Math.round(limit * 0.7);
  const followingTarget = Math.round(limit * 0.2);
  const discoveryTarget = Math.max(limit - interestTarget - followingTarget, 0);

  const seen = new Set();
  const result = [];

  const take = (pool, max) => {
    let taken = 0;
    for (const item of pool) {
      if (taken >= max || result.length >= limit) return;
      const id = String(item._id);
      if (seen.has(id)) continue;
      seen.add(id);
      result.push(item);
      taken += 1;
    }
  };

  take(interestPool, interestTarget);
  take(followingPool, followingTarget);
  take(discoveryPool, discoveryTarget);

  for (const pool of [interestPool, followingPool, discoveryPool]) {
    for (const item of pool) {
      if (result.length >= limit) break;
      const id = String(item._id);
      if (!seen.has(id)) {
        seen.add(id);
        result.push(item);
      }
    }
  }

  return result;
};

const formatExplorePost = (post, userReaction = null) => ({
  _id: post._id,
  content: post.content,
  media: post.media || [],
  category: post.category,
  tags: post.tags || [],
  likesCount: post.totalReactions || 0,
  reactions: post.reactions || {},
  commentsCount: post.stats?.comments || 0,
  createdAt: post.createdAt,
  isLiked: !!userReaction,
  userReaction,
  feedType: 'post',
  author: {
    userId: post.author?._id,
    username: post.author?.username,
    fullName: post.author?.profile?.fullName || post.author?.username,
    avatar: post.author?.profile?.avatar?.url || null,
  },
});

const formatExploreBlog = (blog, isLiked = false) => ({
  _id: blog._id,
  title: blog.title,
  summary: blog.summary,
  coverImage: blog.coverImage,
  readTime: blog.readTime,
  category: blog.category,
  tags: blog.tags || [],
  likesCount: blog.stats?.likes || 0,
  commentsCount: blog.stats?.comments || 0,
  views: blog.stats?.views || 0,
  createdAt: blog.createdAt,
  publishedAt: blog.publishedAt,
  isLiked,
  feedType: 'blog',
  author: {
    userId: blog.author?._id,
    username: blog.author?.username,
    fullName: blog.author?.profile?.fullName || blog.author?.username,
    avatar: blog.author?.profile?.avatar?.url || null,
  },
});

const buildExploreSection = async (user, userId, contentType, limit, skip) => {
  const totalNeeded = skip + limit;
  const poolSize = Math.max(totalNeeded * 4, 40);
  const interestKeys = getUserInterestKeys(user);
  const followingIds = user.following || [];
  const authorField = { author: { $nin: [userId] } };

  let interestItems = [];
  let followingItems = [];
  let discoveryItems = [];

  if (contentType === 'post') {
    const basePostQuery = { visibility: 'public', status: 'active', ...authorField };

    if (interestKeys.length > 0) {
      interestItems = await Post.find({
        ...basePostQuery,
        $or: [{ category: { $in: interestKeys } }, { tags: { $in: interestKeys } }],
      })
        .populate('author', 'username profile.fullName profile.avatar')
        .sort({ engagementScore: -1, createdAt: -1 })
        .limit(poolSize)
        .lean();
    } else {
      interestItems = await Post.find(basePostQuery)
        .populate('author', 'username profile.fullName profile.avatar')
        .sort({ engagementScore: -1, createdAt: -1 })
        .limit(poolSize)
        .lean();
    }

    if (followingIds.length > 0) {
      followingItems = await Post.find({
        ...basePostQuery,
        author: { $in: followingIds },
      })
        .populate('author', 'username profile.fullName profile.avatar')
        .sort({ createdAt: -1 })
        .limit(poolSize)
        .lean();
    }

    discoveryItems = await Post.find({
      ...basePostQuery,
      ...(interestKeys.length > 0
        ? { category: { $nin: interestKeys }, tags: { $nin: interestKeys } }
        : {}),
    })
      .populate('author', 'username profile.fullName profile.avatar')
      .sort({ engagementScore: -1, createdAt: -1 })
      .limit(poolSize)
      .lean();
  } else {
    const baseBlogQuery = { status: 'published', ...authorField };

    if (interestKeys.length > 0) {
      interestItems = await Blog.find({
        ...baseBlogQuery,
        $or: [{ category: { $in: interestKeys } }, { tags: { $in: interestKeys } }],
      })
        .populate('author', 'username profile.fullName profile.avatar')
        .sort({ engagementScore: -1, publishedAt: -1, createdAt: -1 })
        .limit(poolSize)
        .lean();
    } else {
      interestItems = await Blog.find(baseBlogQuery)
        .populate('author', 'username profile.fullName profile.avatar')
        .sort({ engagementScore: -1, publishedAt: -1, createdAt: -1 })
        .limit(poolSize)
        .lean();
    }

    if (followingIds.length > 0) {
      followingItems = await Blog.find({
        ...baseBlogQuery,
        author: { $in: followingIds },
      })
        .populate('author', 'username profile.fullName profile.avatar')
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(poolSize)
        .lean();
    }

    discoveryItems = await Blog.find({
      ...baseBlogQuery,
      ...(interestKeys.length > 0
        ? { category: { $nin: interestKeys }, tags: { $nin: interestKeys } }
        : {}),
    })
      .populate('author', 'username profile.fullName profile.avatar')
      .sort({ engagementScore: -1, publishedAt: -1, createdAt: -1 })
      .limit(poolSize)
      .lean();
  }

  const interestScored = scoreContentPool(user, interestItems, contentType);
  const followingScored = scoreContentPool(user, followingItems, contentType);
  const discoveryScored = scoreContentPool(user, discoveryItems, contentType);
  const mixed = pickMixedFeed(interestScored, followingScored, discoveryScored, totalNeeded);
  const pageItems = mixed.slice(skip, skip + limit);

  return {
    items: pageItems,
    hasMore: mixed.length > skip + limit || pageItems.length === limit,
  };
};

/**
 * Explore feed: separate posts + blogs sections
 * Mix per section: 70% interest, 20% following, 10% discovery
 */
const getExploreFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const postsLimit = Math.min(parseInt(req.query.postsLimit, 10) || 8, 20);
    const blogsLimit = Math.min(parseInt(req.query.blogsLimit, 10) || 6, 20);
    const postsSkip = Math.max(parseInt(req.query.postsSkip, 10) || 0, 0);
    const blogsSkip = Math.max(parseInt(req.query.blogsSkip, 10) || 0, 0);

    const user = await User.findById(userId).select(
      'interestScores following preferences.interests',
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [postsSection, blogsSection] = await Promise.all([
      postsLimit > 0
        ? buildExploreSection(user, userId, 'post', postsLimit, postsSkip)
        : Promise.resolve({ items: [], hasMore: false }),
      blogsLimit > 0
        ? buildExploreSection(user, userId, 'blog', blogsLimit, blogsSkip)
        : Promise.resolve({ items: [], hasMore: false }),
    ]);

    const postIds = postsSection.items.map((p) => p._id);
    const blogIds = blogsSection.items.map((b) => b._id);

    const [postLikes, blogLikes] = await Promise.all([
      postIds.length
        ? PostLike.find({ userId, postId: { $in: postIds } }).select('postId reactionType').lean()
        : [],
      blogIds.length
        ? BlogLike.find({ userId, blogId: { $in: blogIds } }).select('blogId').lean()
        : [],
    ]);

    const postReactionMap = {};
    postLikes.forEach((like) => {
      postReactionMap[String(like.postId)] = like.reactionType;
    });
    const likedBlogIds = new Set(blogLikes.map((like) => String(like.blogId)));

    const posts = postsSection.items.map((post) =>
      formatExplorePost(post, postReactionMap[String(post._id)] || null),
    );
    const blogs = blogsSection.items.map((blog) =>
      formatExploreBlog(blog, likedBlogIds.has(String(blog._id))),
    );

    return res.status(200).json({
      success: true,
      posts,
      blogs,
      mix: { interest: 70, following: 20, discovery: 10 },
      postsHasMore: postsSection.hasMore,
      blogsHasMore: blogsSection.hasMore,
    });
  } catch (error) {
    console.error('Get explore feed error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

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
  getExploreFeed,

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
