const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const Blog = require('../models/blogs.model');
const User = require('../models/user.model');
const { sanitizePlainText } = require('../utils/sanitize.util');
const { pushNotification } = require('./notification.controller');

const serializeComment = (comment) => {
  const commentObject = typeof comment.toObject === 'function' ? comment.toObject() : comment;
  const user = commentObject.user || {};

  return {
    ...commentObject,
    id: commentObject._id,
    text: commentObject.content,
    user: {
      ...user,
      name: user.username || user.name,
      profileImage: user.avatar ? { url: user.avatar } : undefined,
    },
  };
};

const createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;
    const { text } = req.body;
    const targetType = req.body.targetType === 'Blog' ? 'Blog' : 'Post';
    const user = await User.findById(userId).select('username profile.avatar');

    const cleaned = sanitizePlainText(text, 4000);
    if (!cleaned.trim()) {
      return res.status(400).json({
        sucess: false,
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

    if (targetType === 'Blog') {
      await Blog.findByIdAndUpdate(postId, { $inc: { 'stats.comments': 1 } });
      // Notify blog author
      pushNotification({ recipient: targetExists.author, actor: userId, type: 'comment', blog: postId, comment: comment._id });
    } else {
      await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
      // Notify post owner
      pushNotification({ recipient: targetExists.user, actor: userId, type: 'comment', post: postId, comment: comment._id });
    }

    return res.status(201).json({
      sucess: true,
      message: 'comment created sucessfully',
      comment: serializeComment(comment),
    });
  } catch (error) {
    return res.status(500).json({
      sucess: false,
      message: error.message,
    });
  }
};

const getPostComments = async (req, res) => {
  try {
    const postId = req.params.postId;
    const targetType = req.query.type === 'Blog' ? 'Blog' : 'Post';

    const comments = await Comment.find({
      'target.type': targetType,
      'target.id': postId,
      parentComment: null,
    })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      comments: comments.map(serializeComment),
    });
  } catch (error) {
    return res.status(500).json({
      sucess: false,
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

    return res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      comment: serializeComment(comment),
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
        $inc: { commentsCount: -1 },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Comment deleted sucessfully',
    });
  } catch (error) {
    return res.status(500).json({
      sucess: false,
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
