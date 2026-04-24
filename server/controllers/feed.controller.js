const Post = require('../models/post.model');
const Blog = require('../models/blogs.model');
const PostLike = require('../models/post-like.model');
const BlogLike = require('../models/blog-like.model');

// Get posts feed
const getPostsFeed = async (req, res) => {
  try {
    const userId = req.user?.id;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Get posts with minimal author details
    const posts = await Post.find({ isPublic: true })
      .populate('user', '_id username profile.fullName profile.avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get user's liked posts if authenticated
    let likedPostIds = [];
    if (userId) {
      const likes = await PostLike.find({ 
        userId, 
        postId: { $in: posts.map(p => p._id) } 
      }).select('postId').lean();
      
      likedPostIds = likes.map(like => String(like.postId));
    }

    // Format posts with clean author data
    const postsWithLikes = posts.map(post => {
      const { user, ...postData } = post;
      
      return {
        _id: postData._id,
        content: postData.content,
        media: postData.media,
        tags: postData.tags,
        likesCount: postData.likesCount || 0,
        commentsCount: postData.commentsCount || 0,
        createdAt: postData.createdAt,
        isLiked: likedPostIds.includes(String(postData._id)),
        author: {
          userId: user?._id,
          username: user?.username,
          fullName: user?.profile?.fullName || user?.username,
          avatar: user?.profile?.avatar?.url || null
        }
      };
    });

    const total = await Post.countDocuments({ isPublic: true });
    const hasMore = skip + posts.length < total;

    res.json({
      success: true,
      posts: postsWithLikes,
      pagination: {
        page,
        limit,
        total,
        hasMore
      }
    });

  } catch (error) {
    console.error('Get posts feed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load posts feed'
    });
  }
};

// Get blogs feed
const getBlogsFeed = async (req, res) => {
  try {
    const userId = req.user?.id;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Get blogs with minimal author details
    const blogs = await Blog.find({ status: 'published' })
      .populate('author', '_id username profile.fullName profile.avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get user's liked blogs if authenticated
    let likedBlogIds = [];
    if (userId) {
      const likes = await BlogLike.find({ 
        userId, 
        blogId: { $in: blogs.map(b => b._id) } 
      }).select('blogId').lean();
      
      likedBlogIds = likes.map(like => String(like.blogId));
    }

    // Format blogs with clean author data
    const blogsWithLikes = blogs.map(blog => {
      const { author, ...blogData } = blog;
      
      return {
        _id: blogData._id,
        title: blogData.title,
        summary: blogData.summary,
        coverImage: blogData.coverImage,
        readTime: blogData.readTime,
        category: blogData.category,
        likesCount: blogData.stats?.likes || 0,
        commentsCount: blogData.stats?.comments || 0,
        views: blogData.stats?.views || 0,
        createdAt: blogData.createdAt,
        publishedAt: blogData.publishedAt,
        isLiked: likedBlogIds.includes(String(blogData._id)),
        author: {
          userId: author?._id,
          username: author?.username,
          fullName: author?.profile?.fullName || author?.username,
          avatar: author?.profile?.avatar?.url || null
        }
      };
    });

    const total = await Blog.countDocuments({ status: 'published' });
    const hasMore = skip + blogs.length < total;

    res.json({
      success: true,
      blogs: blogsWithLikes,
      pagination: {
        page,
        limit,
        total,
        hasMore
      }
    });

  } catch (error) {
    console.error('Get blogs feed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load blogs feed'
    });
  }
};

module.exports = {
  getPostsFeed,
  getBlogsFeed
};
