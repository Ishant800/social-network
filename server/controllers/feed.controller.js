const Post = require('../models/post.model');
const Blog = require('../models/blogs.model');
const PostLike = require('../models/post-like.model');
const BlogLike = require('../models/blog-like.model');

// Helper function for seeded random (for consistent randomization within a request)
function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Helper function for fuzzy tag matching (case-insensitive, partial match)
function calculateTagMatch(postTag, userInterest) {
  const tagLower = postTag.toLowerCase().trim();
  const interestLower = userInterest.toLowerCase().trim();
  
  // Exact match
  if (tagLower === interestLower) return 10;
  
  // One contains the other (min 4 chars)
  if (tagLower.length >= 4 && interestLower.length >= 4) {
    if (tagLower.includes(interestLower) || interestLower.includes(tagLower)) {
      return 7;
    }
  }
  
  // Check if 4-5 consecutive characters match
  if (tagLower.length >= 4 && interestLower.length >= 4) {
    for (let i = 0; i <= tagLower.length - 4; i++) {
      const substring = tagLower.substring(i, i + 5);
      if (interestLower.includes(substring)) {
        return 5;
      }
    }
  }
  
  return 0;
}

// Get posts feed
const getPostsFeed = async (req, res) => {
  try {
    const userId = req.user?.id;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Get user's interests for personalized feed
    let userInterests = [];
    let hasInterests = false;
    if (userId) {
      const User = require('../models/user.model');
      const user = await User.findById(userId).select('preferences.interests');
      userInterests = user?.preferences?.interests || [];
      hasInterests = userInterests.length > 0;
    }

    // Fetch more posts for better sorting
    const fetchLimit = hasInterests ? limit * 4 : limit * 2;
    
    // Get posts with minimal author details
    let posts = await Post.find({ isPublic: true })
      .populate('user', '_id username profile.fullName profile.avatar')
      .sort({ createdAt: -1 })
      .limit(fetchLimit)
      .lean();

    // Calculate scores for each post
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;
    
    // Use timestamp as seed for randomization (changes every request)
    const randomSeed = now;

    posts = posts.map((post, index) => {
      const postAge = now - new Date(post.createdAt).getTime();
      const isRecent = postAge < oneWeekMs;
      
      // Engagement score: likes + comments * 2
      const engagementScore = (post.likesCount || 0) + (post.commentsCount || 0) * 2;
      
      // Viral score: high engagement + recent
      const viralScore = isRecent ? engagementScore * (1 - postAge / oneWeekMs) : engagementScore * 0.3;
      
      // Interest matching score
      let interestScore = 0;
      if (hasInterests && post.tags && post.tags.length > 0) {
        post.tags.forEach(postTag => {
          userInterests.forEach(interest => {
            const matchScore = calculateTagMatch(postTag, interest);
            interestScore += matchScore;
          });
        });
      }
      
      // Add small random factor for variety (0-5 points)
      const randomFactor = seededRandom(randomSeed + index) * 5;
      
      // Final score: interest match (highest priority) + viral score + random factor
      const finalScore = (interestScore * 100) + viralScore + randomFactor;
      
      return {
        ...post,
        interestScore,
        viralScore,
        finalScore,
        isRelevant: interestScore > 0
      };
    });

    // Sort by final score (interest + viral), then by date, with randomization for similar scores
    posts.sort((a, b) => {
      // If scores are very close (within 10%), add randomization
      const scoreDiff = Math.abs(a.finalScore - b.finalScore);
      const avgScore = (a.finalScore + b.finalScore) / 2;
      const isCloseScore = avgScore > 0 && scoreDiff / avgScore < 0.1;
      
      if (isCloseScore) {
        // Add random factor for variety
        return Math.random() - 0.5;
      }
      
      if (a.finalScore !== b.finalScore) {
        return b.finalScore - a.finalScore;
      }
      
      // For posts with same score, randomize instead of always sorting by date
      return Math.random() - 0.5;
    });

    // Apply pagination after sorting
    posts = posts.slice(skip, skip + limit);

    // Get user's liked posts and reaction types if authenticated
    let userReactions = {};
    if (userId) {
      const likes = await PostLike.find({ 
        userId, 
        postId: { $in: posts.map(p => p._id) } 
      }).select('postId reactionType').lean();
      
      likes.forEach(like => {
        userReactions[String(like.postId)] = like.reactionType;
      });
    }

    // Format posts with clean author data
    const postsWithLikes = posts.map(post => {
      const { user, interestScore, viralScore, finalScore, isRelevant, ...postData } = post;
      const userReaction = userReactions[String(postData._id)] || null;
      
      return {
        _id: postData._id,
        content: postData.content,
        media: postData.media,
        tags: postData.tags,
        likesCount: postData.likesCount || 0,
        reactions: postData.reactions || {},
        commentsCount: postData.commentsCount || 0,
        createdAt: postData.createdAt,
        isLiked: !!userReaction,
        userReaction,
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
      hasInterests, // Send this to frontend
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
