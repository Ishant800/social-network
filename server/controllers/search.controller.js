const User = require('../models/user.model');
const Post = require('../models/post.model');
const Blog = require('../models/blogs.model');

// Helper function for fuzzy matching score
function calculateMatchScore(text, query) {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Exact match
  if (textLower === queryLower) return 100;
  
  // Starts with query
  if (textLower.startsWith(queryLower)) return 90;
  
  // Contains query
  if (textLower.includes(queryLower)) return 80;
  
  // Check for partial matches (4-5 consecutive characters)
  if (queryLower.length >= 4) {
    for (let i = 0; i <= queryLower.length - 4; i++) {
      const substring = queryLower.substring(i, Math.min(i + 5, queryLower.length));
      if (textLower.includes(substring)) {
        return 70;
      }
    }
  }
  
  // Check if most characters match (fuzzy)
  let matchCount = 0;
  for (let char of queryLower) {
    if (textLower.includes(char)) matchCount++;
  }
  const matchRatio = matchCount / queryLower.length;
  if (matchRatio > 0.6) return 50;
  
  return 0;
}

const search = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const query = q.trim();
    const queryLower = query.toLowerCase();

    // Search users by username and full name with fuzzy matching
    const allUsers = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: queryLower, $options: 'i' } },
            { 'profile.fullName': { $regex: queryLower, $options: 'i' } },
          ],
        },
        {
          $or: [
            { 'privacy.discoverable': { $ne: false } },
            { 'privacy.discoverable': { $exists: false } },
          ],
        },
      ],
    })
      .select('username profile.fullName profile.avatar followers')
      .limit(50) // Fetch more for scoring
      .lean();

    // Score and sort users
    const scoredUsers = allUsers.map(user => {
      const usernameScore = calculateMatchScore(user.username, query);
      const fullNameScore = user.profile?.fullName 
        ? calculateMatchScore(user.profile.fullName, query)
        : 0;
      const maxScore = Math.max(usernameScore, fullNameScore);
      
      return {
        ...user,
        matchScore: maxScore
      };
    })
    .filter(user => user.matchScore >= 50) // Only show good matches
    .sort((a, b) => {
      // Sort by match score first, then by followers
      if (a.matchScore !== b.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return (b.followers?.length || 0) - (a.followers?.length || 0);
    })
    .slice(0, 10);

    // Remove matchScore before sending
    const users = scoredUsers.map(({ matchScore, ...user }) => user);

    // Search posts by tags with fuzzy matching
    const allPosts = await Post.find({
      isPublic: true,
      tags: { $exists: true, $ne: [] }
    })
      .populate('user', 'username profile.fullName profile.avatar')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Score and filter posts
    const posts = allPosts
      .map(post => {
        let maxScore = 0;
        if (post.tags && post.tags.length > 0) {
          post.tags.forEach(tag => {
            const score = calculateMatchScore(tag, query);
            if (score > maxScore) maxScore = score;
          });
        }
        return { ...post, matchScore: maxScore };
      })
      .filter(post => post.matchScore >= 50)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10)
      .map(({ matchScore, ...post }) => post);

    // Search blogs by category and title
    const allBlogs = await Blog.find({
      status: 'published',
      $or: [
        { 'category.name': { $regex: queryLower, $options: 'i' } },
        { title: { $regex: queryLower, $options: 'i' } }
      ]
    })
      .populate('author', 'username profile.fullName profile.avatar')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Score and sort blogs
    const blogs = allBlogs
      .map(blog => {
        const categoryScore = blog.category?.name 
          ? calculateMatchScore(blog.category.name, query)
          : 0;
        const titleScore = calculateMatchScore(blog.title, query);
        const maxScore = Math.max(categoryScore, titleScore);
        
        return { ...blog, matchScore: maxScore };
      })
      .filter(blog => blog.matchScore >= 50)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10)
      .map(({ matchScore, ...blog }) => blog);

    return res.status(200).json({
      success: true,
      query,
      results: {
        users,
        posts,
        blogs
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { search };
