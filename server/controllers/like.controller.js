const PostLike = require('../models/post-like.model');
const BlogLike = require('../models/blog-like.model');
const Post = require('../models/post.model');
const Blog = require('../models/blogs.model');
const { pushNotification } = require('./notification.controller');

// Like a post
const likePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    // Check if post exists
    const post = await Post.findById(postId).populate('user', '_id');
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Check if already liked
    const existingLike = await PostLike.findOne({ userId, postId });
    if (existingLike) {
      return res.status(400).json({ success: false, error: 'Post already liked' });
    }

    // Create like
    await PostLike.create({ userId, postId });

    // Update post likes count
    const likesCount = await PostLike.countDocuments({ postId });
    await Post.findByIdAndUpdate(postId, { likesCount });

    // Send notification to post owner (if not liking own post)
    if (String(post.user._id) !== String(userId)) {
      await pushNotification({
        recipient: post.user._id,
        actor: userId,
        type: 'like',
        post: postId
      });
    }

    res.status(201).json({
      success: true,
      message: 'Post liked',
      postId,
      likesCount,
      isLiked: true
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Unlike a post
const unlikePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    // Check if like exists
    const like = await PostLike.findOne({ userId, postId });
    if (!like) {
      return res.status(404).json({ success: false, error: 'Like not found' });
    }

    // Delete like
    await PostLike.findOneAndDelete({ userId, postId });
    
    // Update post likes count
    const likesCount = await PostLike.countDocuments({ postId });
    await Post.findByIdAndUpdate(postId, { likesCount });

    res.status(200).json({
      success: true,
      message: 'Post unliked',
      postId,
      likesCount,
      isLiked: false
    });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Like a blog
const likeBlog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { blogId } = req.params;

    // Check if blog exists
    const blog = await Blog.findById(blogId).populate('author', '_id');
    if (!blog) {
      return res.status(404).json({ success: false, error: 'Blog not found' });
    }

    // Check if already liked
    const existingLike = await BlogLike.findOne({ userId, blogId });
    if (existingLike) {
      return res.status(400).json({ success: false, error: 'Blog already liked' });
    }

    // Create like
    await BlogLike.create({ userId, blogId });

    // Update blog likes count
    const likesCount = await BlogLike.countDocuments({ blogId });
    await Blog.findByIdAndUpdate(blogId, { 'stats.likes': likesCount });

    // Send notification to blog author (if not liking own blog)
    if (String(blog.author._id) !== String(userId)) {
      await pushNotification({
        recipient: blog.author._id,
        actor: userId,
        type: 'like',
        blog: blogId
      });
    }

    res.status(201).json({
      success: true,
      message: 'Blog liked',
      postId: blogId,
      likesCount,
      isLiked: true
    });
  } catch (error) {
    console.error('Like blog error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Unlike a blog
const unlikeBlog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { blogId } = req.params;

    // Check if like exists
    const like = await BlogLike.findOne({ userId, blogId });
    if (!like) {
      return res.status(404).json({ success: false, error: 'Like not found' });
    }

    // Delete like
    await like.deleteOne();

    // Update blog likes count
    const likesCount = await BlogLike.countDocuments({ blogId });
    await Blog.findByIdAndUpdate(blogId, { 'stats.likes': likesCount });

    res.json({
      success: true,
      message: 'Blog unliked',
      postId: blogId,
      likesCount,
      isLiked: false
    });
  } catch (error) {
    console.error('Unlike blog error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = {
  likePost,
  unlikePost,
  likeBlog,
  unlikeBlog
};
