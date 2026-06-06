const mongoose = require('mongoose');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const User = require('../models/user.model');
const { sanitizePlainText } = require('../utils/sanitize.util');
const {
  generatePersona,
  stripUserFromPost,
  stripUserFromComment,
  CONFESSION_CATEGORIES,
} = require('../utils/anonymous.util');

const createConfession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content: rawContent, category } = req.body;
    const content = sanitizePlainText(rawContent, 10000);

    let voice = null;
    if (req.file) {
      const duration = Math.min(Math.max(parseFloat(req.body.duration) || 0, 0), 300);
      voice = {
        url: req.file.secure_url || req.file.path || req.file.url,
        public_id: req.file.filename || req.file.public_id,
        duration,
      };
    }

    if (!content?.trim() && !voice) {
      return res.status(400).json({
        success: false,
        message: 'Write a confession or record a voice message',
      });
    }

    const persona = generatePersona();
    const safeCategory = CONFESSION_CATEGORIES.includes(category) ? category : 'Other';

    let tagsArray = [];
    if (req.body.tags) {
      const raw = req.body.tags;
      tagsArray = (Array.isArray(raw) ? raw : String(raw).split(','))
        .map((t) => sanitizePlainText(String(t).replace(/^#/, ''), 48))
        .filter(Boolean);
    }

    const post = await Post.create({
      author: userId,
      content: content?.trim() || '',
      voice,
      isVoicePost: Boolean(voice),
      tags: tagsArray,
      isPublic: true,
      isAnonymous: true,
      category: safeCategory,
      anonymousPersona: persona,
    });

    await User.findByIdAndUpdate(userId, { $inc: { 'stats.posts': 1 } });

    return res.status(201).json({
      success: true,
      message: 'Confession posted anonymously',
      confession: stripUserFromPost(post),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getConfessions = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 15, 50);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const { category } = req.query;

    const filter = { isAnonymous: true, isPublic: true, isVoicePost: { $ne: true } };
    if (category && category !== 'All' && CONFESSION_CATEGORIES.includes(category)) {
      filter.category = category;
    }

    const [posts, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Post.countDocuments(filter),
    ]);

    const confessions = posts.map(stripUserFromPost);

    return res.status(200).json({
      success: true,
      confessions,
      categories: ['All', ...CONFESSION_CATEGORIES],
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getVoiceStories = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 15, 50);
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;
    const { category } = req.query;

    const filter = {
      isAnonymous: true,
      isPublic: true,
      isVoicePost: true,
      'voice.url': { $exists: true, $ne: '' },
    };
    if (category && category !== 'All' && CONFESSION_CATEGORIES.includes(category)) {
      filter.category = category;
    }

    const [posts, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Post.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      stories: posts.map(stripUserFromPost),
      categories: ['All', ...CONFESSION_CATEGORIES],
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getTrendingConfessions = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 6, 12);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const posts = await Post.find({
      isAnonymous: true,
      isPublic: true,
      isVoicePost: { $ne: true },
      createdAt: { $gte: oneWeekAgo },
    })
      .sort({ likesCount: -1, commentsCount: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      trending: posts.map(stripUserFromPost),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getConfessionDetails = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ success: false, message: 'Invalid post id' });
    }

    const post = await Post.findOne({ _id: postId, isAnonymous: true }).lean();
    if (!post) {
      return res.status(404).json({ success: false, message: 'Confession not found' });
    }

    const comments = await Comment.find({
      'target.type': 'Post',
      'target.id': postId,
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      confession: stripUserFromPost(post),
      comments: comments.map(stripUserFromComment),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createAnonymousReply = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const { text, parentCommentId } = req.body;

    const cleaned = sanitizePlainText(text, 4000);
    if (!cleaned.trim()) {
      return res.status(400).json({ success: false, message: 'Reply text is required' });
    }

    const post = await Post.findOne({ _id: postId, isAnonymous: true });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Confession not found' });
    }

    const persona = generatePersona();

    const comment = await Comment.create({
      user: { _id: userId },
      content: cleaned,
      target: { type: 'Post', id: postId },
      parentComment: parentCommentId || null,
      isAnonymous: true,
      anonymousPersona: persona,
    });

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    return res.status(201).json({
      success: true,
      message: 'Anonymous reply posted',
      comment: stripUserFromComment(comment),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAnonymousComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findOne({ _id: postId, isAnonymous: true });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Confession not found' });
    }

    const comments = await Comment.find({
      'target.type': 'Post',
      'target.id': postId,
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      comments: comments.map(stripUserFromComment),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createConfession,
  getConfessions,
  getVoiceStories,
  getTrendingConfessions,
  getConfessionDetails,
  createAnonymousReply,
  getAnonymousComments,
  CONFESSION_CATEGORIES,
};
