const PostLike = require('../models/post-like.model');
const BlogLike = require('../models/blog-like.model');
const Post = require('../models/post.model');
const Blog = require('../models/blogs.model');
const { pushNotification } = require('./notification.controller');

// Helper: recalculate and save reaction counts on a post
async function syncReactions(postId) {
  const counts = await PostLike.aggregate([
    { $match: { postId: require('mongoose').Types.ObjectId.createFromHexString(postId.toString()) } },
    { $group: { _id: '$reactionType', count: { $sum: 1 } } }
  ]);

  const reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
  counts.forEach(({ _id, count }) => { reactions[_id] = count; });
  const likesCount = Object.values(reactions).reduce((a, b) => a + b, 0);

  await Post.findByIdAndUpdate(postId, { reactions, likesCount });
  return { reactions, likesCount };
}

// React to a post (like, love, haha, wow, sad, angry)
const reactToPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const { reactionType = 'like' } = req.body;

    const post = await Post.findById(postId).populate('user', '_id');
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    const existing = await PostLike.findOne({ userId, postId });

    if (existing) {
      if (existing.reactionType === reactionType) {
        // Same reaction → remove it (toggle off)
        await PostLike.findOneAndDelete({ userId, postId });
        const { reactions, likesCount } = await syncReactions(postId);
        return res.json({ success: true, postId, likesCount, reactions, userReaction: null });
      } else {
        // Different reaction → update it
        existing.reactionType = reactionType;
        await existing.save();
      }
    } else {
      // New reaction
      await PostLike.create({ userId, postId, reactionType });

      // Notify post owner
      if (String(post.user._id) !== String(userId)) {
        await pushNotification({ recipient: post.user._id, actor: userId, type: 'like', post: postId });
      }
    }

    const { reactions, likesCount } = await syncReactions(postId);
    return res.json({ success: true, postId, likesCount, reactions, userReaction: reactionType });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Remove reaction from a post
const removeReaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    await PostLike.findOneAndDelete({ userId, postId });
    const { reactions, likesCount } = await syncReactions(postId);

    res.json({ success: true, postId, likesCount, reactions, userReaction: null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Keep old like/unlike for backward compat (blogs still use these)
const likePost = async (req, res) => {
  req.body.reactionType = 'like';
  return reactToPost(req, res);
};

const unlikePost = async (req, res) => {
  return removeReaction(req, res);
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
  unlikeBlog,
  reactToPost,
  removeReaction
};
