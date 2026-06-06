const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const Blog = require('../models/blogs.model');
const User = require('../models/user.model');
const { sanitizePlainText } = require('../utils/sanitize.util');
const { pushNotification } = require('./notification.controller');

// Optimized serializer - returns only necessary fields
const serializeComment = (comment, userDoc = null) => {
  const commentObject = typeof comment.toObject === 'function' ? comment.toObject() : comment;
  
  // Use userDoc if provided, otherwise use comment.user
  const user = userDoc || commentObject.user || {};
  
  return {
    _id: commentObject._id,
    content: commentObject.content,
    createdAt: commentObject.createdAt,
    user: {
      _id: user._id,
      username: user.username,
      fullName: user.profile?.fullName || user.username,
      avatar: user.profile?.avatar?.url || user.avatar || null,
    },
  };
};

const createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;
    const { text } = req.body;
    const targetType =
      String(req.body.targetType || '').toLowerCase() === 'blog' ? 'Blog' : 'Post';
    
    // Fetch only needed user fields
    const user = await User.findById(userId)
    .select('username profile.fullName profile.avatar');

    const cleaned = sanitizePlainText(text, 4000);
    if (!cleaned.trim()) {
      return res.status(400).json({
        success: false,
        message: 'comment text is required',
      });
    }

    const targetExists =
      targetType === 'Blog' ? await Blog.findById(postId) : await Post.findById(postId);
    if (!targetExists) {
      return res.status(404).json({
        success: false,
        message: `${targetType} not found`,
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const comment = await Comment.create({
      user: {
        _id: user._id,
        username: user.username,
        avatar: user.profile?.avatar?.url || '',
      },
      content: cleaned,
      target: {
        type: targetType,
        id: postId,
      },
    });

    // Update comment count and get updated target
    let updatedTarget;
    if (targetType === 'Blog') {
      updatedTarget = await Blog.findByIdAndUpdate(
        postId, 
        { $inc: { 'stats.comments': 1 } },
        { new: true }
      ).select('stats.comments');
      // Notify blog author
      pushNotification({ recipient: targetExists.author, actor: userId, type: 'comment', blog: postId, comment: comment._id });
    } else {
      updatedTarget = await Post.findByIdAndUpdate(
        postId, 
        { $inc: { 'stats.comments': 1 } },
        { new: true }
      ).select('stats.comments');
      // Notify post owner
      pushNotification({ recipient: targetExists.author, actor: userId, type: 'comment', post: postId, comment: comment._id });
    }

    return res.status(201).json({
      success: true,
      message: 'comment created successfully',
      comment: serializeComment(comment, user),
      postId: postId,
      stats: updatedTarget?.stats,
      commentsCount: updatedTarget?.stats?.comments || 0
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPostComments = async (req, res) => {
  try {
    const postId = req.params.postId;
    const targetType =
      String(req.query.type || '').toLowerCase() === 'blog' ? 'Blog' : 'Post';

    // Get comments
    const comments = await Comment.find({
      'target.type': targetType,
      'target.id': postId,
      parentComment: null,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Extract unique user IDs
    const userIds = [...new Set(comments.map(c => c.user._id.toString()))];
    
    // Fetch user data for all comment authors in one query
    const users = await User.find({ _id: { $in: userIds } })
      .select('_id username profile.fullName profile.avatar')
      .lean();
    
    // Create user map for quick lookup
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });

    // Serialize comments with fetched user data
    const serializedComments = comments.map(comment => {
      const userDoc = userMap[comment.user._id.toString()];
      return serializeComment(comment, userDoc);
    });

    return res.status(200).json({
      success: true,
      comments: serializedComments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const commentId = req.params.commentId;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'comment text is required',
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (comment.user?._id?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    comment.content = text.trim();
    await comment.save();

    // Fetch user data
    const user = await User.findById(userId).select('username profile.fullName profile.avatar');

    return res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      comment: serializeComment(comment, user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const commentId = req.params.commentId;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (comment.user?._id?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }
    
    await Comment.findByIdAndDelete(commentId);

    if (comment.target?.type === 'Blog') {
      await Blog.findByIdAndUpdate(comment.target.id, {
        $inc: { 'stats.comments': -1 },
      });
    }

    if (comment.target?.type === 'Post') {
      await Post.findByIdAndUpdate(comment.target.id, {
        $inc: { 'stats.comments': -1 },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
};
