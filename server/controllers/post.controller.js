const mongoose = require('mongoose');
const Post = require('../models/post.model');
const PostLike = require('../models/post-like.model');
const Comment = require('../models/comment.model');
const User = require('../models/user.model');
const { sanitizePlainText } = require('../utils/sanitize.util');
const { cloudinary } = require('../config/cloudinary.config');

// Interest categories
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

// post create - Accept files from frontend (same as blog upload)
const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content: rawContent, category, tags } = req.body;
    const content = sanitizePlainText(rawContent, 10000);

    // Validate category
    if (!category || !INTEREST_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Category is required and must be one of: ${INTEREST_CATEGORIES.join(', ')}`
      });
    }

    const user = await User.findById(userId).select('username profile.fullName profile.avatar');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required',
      });
    }

    // Handle media files uploaded via multer (same as blog)
    let mediaArray = [];
    if (req.files && req.files.length > 0) {
      mediaArray = req.files.map(file => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    // Process tags
    let tagsArray = [];
    if (tags) {
      if (Array.isArray(tags)) {
        tagsArray = tags;
      } else if (typeof tags === 'string') {
        tagsArray = tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }
    
    tagsArray = tagsArray
      .map((t) => sanitizePlainText(String(t), 48))
      .filter(Boolean);

    if (tagsArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one tag is required'
      });
    }

    const post = await Post.create({
      author: userId,
      content,
      media: mediaArray,
      category,
      tags: tagsArray,
      visibility: 'public'
    });

    if (!post) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create post',
      });
    }

    await User.findByIdAndUpdate(userId, { $inc: { 'stats.posts': 1 } });

    const populatedPost = await Post.findById(post._id).populate(
      'author',
      'username profile.fullName profile.avatar',
    );
    const postData = populatedPost.toObject();

    postData.id = postData._id;
    if (postData.author) {
      postData.author.name = postData.author.profile?.fullName || postData.author.username;
      postData.author.profileImage = postData.author.profile?.avatar || null;
    }

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: postData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const posts = await Post.find({ author: userId })
      .populate('author', 'username profile.fullName profile.avatar')
      .sort({ createdAt: -1 });

    if (!posts || posts.length === 0) {
      return res.status(200).json({
        sucess: 'ok',
        totalCount: 0,
        message: 'no post available',
      });
    }

    return res.status(200).json({
      sucess: 'ok',
      totalCount: posts.length,
      posts: posts.map((post) => {
        const postData = post.toObject();
        postData.id = postData._id;

        if (postData.author) {
          postData.author.name = postData.author.profile?.fullName || postData.author.username;
          postData.author.profileImage = postData.author.profile?.avatar || null;
        }

        return postData;
      }),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message,
    });
  }
};

const getPostDetails = async (req, res) => {
  try {
    const postId = req.params.postId;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post id',
      });
    }

    const post = await Post.findById(postId).populate(
      'author',
      'username profile.fullName profile.avatar',
    );
    if (!post) {
      return res.status(400).json({
        sucess: 'ok',
        message: 'post not found ',
      });
    }

    const comments = await Comment.find({
      'target.type': 'Post',
      'target.id': postId,
      parentComment: null,
    })
      .sort({ createdAt: -1 });

    const userId = req.user?.id || req.user?._id;
    let userReaction = null;
    if (userId) {
      const like = await PostLike.findOne({ userId, postId }).select('reactionType').lean();
      userReaction = like?.reactionType || null;
    }

    const postData = post.toObject();
    postData.id = postData._id;
    postData.likesCount = postData.totalReactions || postData.likesCount || 0;
    postData.commentsCount = postData.stats?.comments ?? comments.length;
    postData.reactions = postData.reactions || {};
    postData.userReaction = userReaction;
    postData.isLiked = !!userReaction;

    if (postData.author) {
      postData.author.userId = postData.author._id;
      postData.author.fullName = postData.author.profile?.fullName || postData.author.username;
      postData.author.name = postData.author.fullName;
      postData.author.avatar = postData.author.profile?.avatar?.url || postData.author.profile?.avatar || null;
      postData.author.profileImage = postData.author.avatar;
    }

    return res.status(200).json({
      success: true,
      post: postData,
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;
    const { content: rawContent, category, tags, keepExisting } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }  

    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this post',
      });
    }

    // Update content if provided
    if (rawContent !== undefined) {
      const content = sanitizePlainText(rawContent, 10000);
      if (!content.trim()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Post content cannot be empty' 
        });
      }
      post.content = content;
    }

    // Update category if provided
    if (category !== undefined) {
      if (!INTEREST_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Category must be one of: ${INTEREST_CATEGORIES.join(', ')}`
        });
      }
      post.category = category;
    }

    // Update tags if provided
    if (tags !== undefined) {
      let tagsArray = [];
      if (Array.isArray(tags)) {
        tagsArray = tags;
      } else if (typeof tags === 'string') {
        tagsArray = tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      }
      post.tags = tagsArray.map((t) => sanitizePlainText(String(t), 48)).filter(Boolean);
    }

    // Handle media files from multer
    if (req.files && req.files.length > 0) {
      const newMedia = req.files.map(file => ({
        url: file.path,
        public_id: file.filename,
      }));
      
      // If keepExisting, append new files to existing
      if (keepExisting === 'true') {
        post.media = [...post.media, ...newMedia];
      } else {
        // Delete old images from cloudinary
        for (const m of post.media) {
          if (m.public_id) {
            try { await cloudinary.uploader.destroy(m.public_id); } catch { /* ignore */ }
          }
        }
        post.media = newMedia;
      }
    }
    // If no new files uploaded but keepExisting is not set, preserve existing media
    // (This handles the case where user edits only text/tags/category)

    await post.save();
    const updatedPost = await Post.findById(postId).populate(
      'author',
      'username profile.fullName profile.avatar',
    );
    const postData = updatedPost.toObject();

    postData.id = postData._id;
    if (postData.author) {
      postData.author.name = postData.author.profile?.fullName || postData.author.username;
      postData.author.profileImage = postData.author.profile?.avatar || null;
    }

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post: postData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this post' });
    }

    // Delete media from cloudinary
    for (const m of post.media) {
      if (m.public_id) {
        try { await cloudinary.uploader.destroy(m.public_id); } catch { /* ignore */ }
      }
    }

    await Post.findByIdAndDelete(postId);
    await User.findByIdAndUpdate(userId, { $inc: { 'stats.posts': -1 } });

    return res.status(200).json({ 
      success: true, 
      message: 'Post deleted successfully' 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Bulk post insert (for testing)
const bulkpostinsert = async(req, res) => {
  try {
    const postdatas = req.body;
    await Post.insertMany(postdatas);
    return res.status(200).json({
      success: true,
      message: "Bulk insert successful"
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  createPost,
  getMyPost,
  getPostDetails,
  updatePost,
  deletePost,
  bulkpostinsert,
};
