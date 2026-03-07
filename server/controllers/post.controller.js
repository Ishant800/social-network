const Post = require('../models/post.model');
const { cloudinary } = require('../config/cloudinary.config');

// post create
const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content,  tags, isPublic } = req.body;

    let mediaUrls = [];
    if (req.files && req.files.length > 0) {
      mediaUrls = req.files.map((file) => file.path);
    }


    let tagsArray = [];

if (req.body.tags) {
  if (Array.isArray(req.body.tags)) {
    tagsArray = req.body.tags;
  } else {
    tagsArray = [req.body.tags];
  }
}

    const post = await Post.create({
      user: userId,
      content,
      media: mediaUrls,
      tags: tagsArray,
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    if (!post) {
      return res.status(400).json({
        sucess: false,
        error: 'failed to create post',
      });
    }

    const populatedPost = await Post.findById(post._id).populate(
      'user',
      'name profileImage',
    );

    return res.status(201).json({
      sucess: true,
      message: 'post create sucessfully',
      post: populatedPost,
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
      .populate('user', 'name username avatar')
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
      posts,
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
  const postId = req.params.postId;
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(400).json({
      sucess: 'ok',
      message: 'post not found ',
    });
  }

  return res.status(200).json({
    sucess: 'ok',
    post,
  });
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

    if (req.body.content) post.content = req.body.content;
    if (req.body.tags) post.tags = req.body.tags;
    if (req.body.isPublic !== undefined) post.isPublic = req.body.isPublic;

    if (req.files && req.files.length > 0) {
      if (post.media.length > 0) {
        for (let url of post.media) {
          const parts = url.split('/');
          const filename = parts[parts.length - 1];
          const publicId = filename.split('.')[0];
          await cloudinary.uploader.destroy(`meroroom/${publicId}`);
        }
      }
      post.media = req.files.map((file) => file.path);
    }

    await post.save();
    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const randomPosts = async(req,res)=>{
  try {
    const posts = await Post.find()
    if(!posts) return  res.status(200).json({
      
      message: "no post available"
    });
    return res.status(200).json({
      posts
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
module.exports = {
  createPost,
  getMyPost,
  getPostDetails,
  updatePost,
  randomPosts
};
