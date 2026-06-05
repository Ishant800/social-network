const Post = require('../models/post.model');
const Blog = require('../models/blogs.model');
const PostLike = require('../models/post-like.model');
const BlogLike = require('../models/blog-like.model');
const User = require('../models/user.model');

function calculateFreshnessBonus(createdAt) {
  const now = Date.now();
  const ageMs = now - new Date(createdAt).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  const ageDays = ageHours / 24;
  
  if (ageHours <= 1) return 50;
  if (ageHours <= 6) return 40;
  if (ageHours <= 24) return 30;
  if (ageDays <= 3) return 20;
  if (ageDays <= 7) return 10;
  return 0;
}

// Calculate post score based on interests, following, engagement, and freshness
function calculatePostScore(post, user, userId) {
  let interestScore = 0;
  let followingBonus = 0;
  let engagementBonus = 0;
  const freshnessBonus = calculateFreshnessBonus(post.createdAt);
  
  // Interest Score (Most Important)
  const userInterestScores = user.interestScores || new Map();
  
  // Category match
  if (post.category && userInterestScores.get(post.category)) {
    interestScore += userInterestScores.get(post.category);
  }
  
  // Tag matches
  if (post.tags && post.tags.length > 0) {
    post.tags.forEach(tag => {
      if (userInterestScores.get(tag)) {
        interestScore += userInterestScores.get(tag);
      }
    });
  }
  
  // Following Bonus
  if (user.following && user.following.some(f => String(f) === String(post.author))) {
    followingBonus = 100;
  }
  
  // Engagement Bonus (scaled down to prevent viral domination)
  const postEngagement = post.engagementScore || 0;
  engagementBonus = postEngagement * 0.3;
  
  // Final Score
  const finalScore = interestScore + followingBonus + engagementBonus + freshnessBonus;
  
  return {
    finalScore,
    interestScore,
    followingBonus,
    engagementBonus,
    freshnessBonus
  };
}

// Apply diversity layer to prevent category repetition
function applyDiversityLayer(posts) {
  const diversePosts = [];
  const categoryTracker = [];
  const MAX_CONSECUTIVE = 3;
  
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const category = post.category;
    
    // Check last 3 posts
    const recentCategories = categoryTracker.slice(-MAX_CONSECUTIVE);
    const sameCategory = recentCategories.filter(c => c === category).length;
    
    if (sameCategory >= MAX_CONSECUTIVE) {
      // Find next post from different category
      const differentPost = posts.slice(i).find(p => p.category !== category);
      if (differentPost) {
        // Swap posts
        const idx = posts.indexOf(differentPost);
        [posts[i], posts[idx]] = [posts[idx], posts[i]];
      }
    }
    
    diversePosts.push(posts[i]);
    categoryTracker.push(posts[i].category);
  }
  
  return diversePosts;
}

const getPostsFeed = async (req, res) => {
  try {

    const userId = req.user?.id;

<<<<<<< Updated upstream
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
=======
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
>>>>>>> Stashed changes
      });
    }

    const user = await User.findById(userId)
      .select("preferences.interests")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    const interests =
      user.preferences?.interests || [];

    if (interests.length === 0) {
      return res.status(200).json({
        success: true,
        posts: [],
        hasInterests: false,
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          hasMore: false
        }
      });
    }

    const posts = await Post.find({
      visibility: "public",
      status: "active",

      $or: [
        {
          category: {
            $in: interests
          }
        },
        {
          tags: {
            $in: interests
          }
        }
      ]
    })
      .populate(
        "author",
        "_id username profile.fullName profile.avatar"
      )
      .sort({
        createdAt: -1
      })
      .limit(10)
      .lean();

    let userReactions = {};

    if (posts.length > 0) {

      const likes = await PostLike.find({
        userId,
        postId: {
          $in: posts.map(p => p._id)
        }
      })
      .select("postId reactionType")
      .lean();

      likes.forEach(like => {
        userReactions[
          String(like.postId)
        ] = like.reactionType;
      });
    }

    const formattedPosts =
      posts.map(post => {

        const userReaction =
          userReactions[
            String(post._id)
          ] || null;

        return {

          _id: post._id,

          content: post.content,

          media: post.media,

          category: post.category,

          tags: post.tags,

          likesCount:
            post.totalReactions || 0,

          reactions:
            post.reactions || {},

          commentsCount:
            post.stats?.comments || 0,

          createdAt:
            post.createdAt,

          isLiked:
            !!userReaction,

          userReaction,

          author: {
            userId:
              post.author?._id,

            username:
              post.author?.username,

            fullName:
              post.author?.profile?.fullName ||
              post.author?.username,

            avatar:
              post.author?.profile?.avatar?.url ||
              null
          }
        };
      });

    return res.status(200).json({
      success: true,
      items: formattedPosts,
      hasInterests: true,
      pagination: {
        page: 1,
        limit: 10,
        total: formattedPosts.length,
        hasMore: false
      }
    });

  } catch (error) {

    console.error(
      "Get posts feed error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Failed to load feed",
      message: error.message
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
        tags: blogData.tags,
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
      items: blogsWithLikes,
      page,
      hasMore,
      meta: {
        total,
        returned: blogsWithLikes.length,
        feedType: 'blogs'
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

/**
 * Update user interest scores based on interaction
 * Called when user interacts with content
 */
const updateInterestScores = async (req, res) => {
  try {
    const userId = req.user.id;
    const { action, category, tags, reactionType } = req.body;

    if (!action || !category) {
      return res.status(400).json({
        success: false,
        error: 'Action and category are required'
      });
    }

    // Define score increments based on action
    const scoreMap = {
      view: 1,
      like: 5,
      love: 8,
      haha: 4,
      wow: 6,
      sad: 3,
      angry: 3,
      comment: 10,
      bookmark: 15,
      share: 20
    };

    // Use reactionType if provided, otherwise use action
    const scoreAction = reactionType || action;
    const increment = scoreMap[scoreAction] || 1;

    // Get current user
    const user = await User.findById(userId).select('interestScores');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Initialize interestScores if needed
    if (!user.interestScores) {
      user.interestScores = new Map();
    }

    // Update category score
    const currentCategoryScore = user.interestScores.get(category) || 0;
    user.interestScores.set(category, currentCategoryScore + increment);

    // Update tag scores
    if (tags && Array.isArray(tags)) {
      tags.forEach(tag => {
        const currentTagScore = user.interestScores.get(tag) || 0;
        user.interestScores.set(tag, currentTagScore + increment);
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Interest scores updated',
      interestScores: Object.fromEntries(user.interestScores)
    });

  } catch (error) {
    console.error('Update interest scores error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update interest scores',
      message: error.message
    });
  }
};

module.exports = {
  getPostsFeed,
  getBlogsFeed,
  updateInterestScores
};
