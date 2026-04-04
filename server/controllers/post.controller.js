const mongoose = require('mongoose');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const User = require('../models/user.model');
const { cloudinary } = require('../config/cloudinary.config');
const { sanitizePlainText } = require('../utils/sanitize.util');

// post create
const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content: rawContent, isPublic } = req.body;
    const content = sanitizePlainText(rawContent, 10000);
    const user = await User.findById(userId).select('username profile.avatar');

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

     let mediaUrls = [];
    if (req.files && req.files.length > 0) {
      mediaUrls = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
    }


    let tagsArray = [];

if (req.body.tags) {
  if (Array.isArray(req.body.tags)) {
    tagsArray = req.body.tags;
  } else {
    tagsArray = String(req.body.tags)
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
}
tagsArray = tagsArray
  .map((t) => sanitizePlainText(String(t), 48))
  .filter(Boolean);

    const post = await Post.create({
      user: userId,
      content,
      media: mediaUrls,
      tags: tagsArray,
      isPublic: isPublic !== undefined ? isPublic === true || isPublic === 'true' : true,
    });

    if (!post) {
      return res.status(400).json({
        sucess: false,
        error: 'failed to create post',
      });
    }

    await User.findByIdAndUpdate(userId, { $inc: { 'stats.posts': 1 } });

    const populatedPost = await Post.findById(post._id).populate(
      'user',
      'username profile.fullName profile.avatar',
    );
    const postData = populatedPost.toObject();

    postData.id = postData._id;
    if (postData.user) {
      postData.user.name = postData.user.profile?.fullName || postData.user.username;
      postData.user.profileImage = postData.user.profile?.avatar || null;
    }

    return res.status(201).json({
      sucess: true,
      message: 'post create sucessfully',
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
    const posts = await Post.find({ user: userId })
      .populate('user', 'username profile.fullName profile.avatar')
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

        if (postData.user) {
          postData.user.name = postData.user.profile?.fullName || postData.user.username;
          postData.user.profileImage = postData.user.profile?.avatar || null;
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
      'user',
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
    const postData = post.toObject();

    postData.id = postData._id;
    if (postData.user) {
      postData.user.name = postData.user.profile?.fullName || postData.user.username;
      postData.user.profileImage = postData.user.profile?.avatar || null;
    }

    return res.status(200).json({
      sucess: 'ok',
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

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'post not found',
      });
    }  

    if (post.user.toString() !== userId) {
      return res.status(203).json({
        sucess: false,
        message: 'Unauthorized  to update this post',
      });
    }

    if (req.body.content !== undefined) {
      const next = sanitizePlainText(req.body.content, 10000);
      if (!next.trim()) {
        return res.status(400).json({ success: false, message: 'Post content cannot be empty' });
      }
      post.content = next;
    }
    if (req.body.tags !== undefined) {
      const raw = req.body.tags;
      const list = Array.isArray(raw)
        ? raw
        : String(raw)
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);
      post.tags = list.map((t) => sanitizePlainText(String(t), 48)).filter(Boolean);
    }
    if (req.body.isPublic !== undefined) {
      post.isPublic = req.body.isPublic === true || req.body.isPublic === 'true';
    }

    if (req.files && req.files.length > 0) {
      if (post.media.length > 0) {
        for (const mediaItem of post.media) {
          if (mediaItem.public_id) {
            await cloudinary.uploader.destroy(mediaItem.public_id);
          }
        }
      }
      post.media = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    await post.save();
    const updatedPost = await Post.findById(postId).populate(
      'user',
      'username profile.fullName profile.avatar',
    );
    const postData = updatedPost.toObject();

    postData.id = postData._id;
    if (postData.user) {
      postData.user.name = postData.user.profile?.fullName || postData.user.username;
      postData.user.profileImage = postData.user.profile?.avatar || null;
    }

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post: postData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createPost,
  getMyPost,
  getPostDetails,
  updatePost,
};
