const User = require('../models/user.model');
const Post = require('../models/post.model');
const Blog = require('../models/blogs.model');

const AUTHOR_FIELDS = 'username profile.fullName profile.avatar';

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function calculateMatchScore(text, query) {
  if (!text) return 0;

  const textLower = String(text).toLowerCase();
  const queryLower = query.toLowerCase();

  if (textLower === queryLower) return 100;
  if (textLower.startsWith(queryLower)) return 90;
  if (textLower.includes(queryLower)) return 80;

  if (queryLower.length >= 3) {
    for (let i = 0; i <= queryLower.length - 3; i++) {
      const substring = queryLower.substring(i, Math.min(i + 4, queryLower.length));
      if (textLower.includes(substring)) return 70;
    }
  }

  return 0;
}

function paginateArray(items, page, limit) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  const safePage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const start = (safePage - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    page: safePage,
    limit,
    total,
    totalPages,
  };
}

function scoreUser(user, query) {
  return calculateMatchScore(user.profile?.fullName, query);
}

function matchesUserFullName(user, query) {
  const fullName = user.profile?.fullName?.trim();
  if (!fullName) return false;
  return scoreUser(user, query) > 0;
}

function scorePost(post, query) {
  const contentScore = calculateMatchScore(post.content, query);
  const categoryScore = calculateMatchScore(post.category, query);
  const tagScores = (post.tags || []).map((tag) => calculateMatchScore(tag, query));

  return Math.max(contentScore, categoryScore, ...tagScores, 1);
}

function scoreBlog(blog, query) {
  const titleScore = calculateMatchScore(blog.title, query);
  const summaryScore = calculateMatchScore(blog.summary, query);
  const categoryScore = calculateMatchScore(blog.category, query);
  const tagScores = (blog.tags || []).map((tag) => calculateMatchScore(tag, query));

  return Math.max(titleScore, summaryScore, categoryScore, ...tagScores, 1);
}

function formatSearchUser(user, followingSet, currentUserId) {
  const id = String(user._id);

  return {
    _id: user._id,
    username: user.username,
    profile: {
      fullName: user.profile?.fullName || '',
      bio: user.profile?.bio || '',
      avatar: user.profile?.avatar || null,
    },
    stats: {
      posts: user.stats?.posts ?? 0,
      followers: user.stats?.followers ?? user.followers?.length ?? 0,
    },
    isFollowing: followingSet.has(id),
    isSelf: currentUserId ? id === String(currentUserId) : false,
  };
}

function formatSearchPost(post) {
  const author = post.author || null;

  return {
    _id: post._id,
    content: post.content,
    media: post.media || [],
    category: post.category,
    tags: post.tags || [],
    visibility: post.visibility,
    stats: post.stats || {},
    reactions: post.reactions || {},
    totalReactions: post.totalReactions || 0,
    createdAt: post.createdAt,
    author: author
      ? {
          _id: author._id,
          username: author.username,
          profile: {
            fullName: author.profile?.fullName || author.username,
            avatar: author.profile?.avatar || null,
          },
        }
      : null,
    user: author
      ? {
          _id: author._id,
          username: author.username,
          profile: {
            fullName: author.profile?.fullName || author.username,
            avatar: author.profile?.avatar || null,
          },
        }
      : null,
  };
}

function formatSearchBlog(blog) {
  const author = blog.author || null;

  return {
    _id: blog._id,
    title: blog.title,
    summary: blog.summary || '',
    coverImage: blog.coverImage || null,
    category: blog.category || '',
    tags: blog.tags || [],
    readTime: blog.readTime,
    stats: blog.stats || {},
    likesCount: blog.stats?.likes || 0,
    commentsCount: blog.stats?.comments || 0,
    createdAt: blog.createdAt,
    publishedAt: blog.publishedAt,
    author: author
      ? {
          _id: author._id,
          username: author.username,
          profile: {
            fullName: author.profile?.fullName || author.username,
            avatar: author.profile?.avatar || null,
          },
        }
      : null,
  };
}

const search = async (req, res) => {
  try {
    const { q, type = 'users', page = 1, limit = 5, preview } = req.query;
    const isPreview = preview === '1' || preview === 'true';

    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const query = q.trim();
    const queryRegex = new RegExp(escapeRegex(query), 'i');
    const pageLimit = Math.min(Math.max(Number(limit) || 5, 1), 20);
    const activeType = ['users', 'posts', 'blogs'].includes(type) ? type : 'users';
    const currentUserId = req.user?.id;

    let followingSet = new Set();
    if (currentUserId) {
      const me = await User.findById(currentUserId).select('following').lean();
      followingSet = new Set((me?.following || []).map((id) => String(id)));
    }

    const [rawUsers, rawPosts, rawBlogs] = await Promise.all([
      User.find({
        status: { $ne: 'deleted' },
        'profile.fullName': queryRegex,
      })
        .select('username profile.fullName profile.bio profile.avatar stats followers')
        .limit(200)
        .lean(),

      Post.find({
        visibility: 'public',
        status: 'active',
        $or: [
          { tags: queryRegex },
          { category: queryRegex },
          { content: queryRegex },
        ],
      })
        .populate('author', AUTHOR_FIELDS)
        .sort({ createdAt: -1 })
        .limit(200)
        .lean(),

      Blog.find({
        status: 'published',
        $or: [
          { title: queryRegex },
          { summary: queryRegex },
          { category: queryRegex },
          { tags: queryRegex },
        ],
      })
        .populate('author', AUTHOR_FIELDS)
        .sort({ createdAt: -1 })
        .limit(200)
        .lean(),
    ]);

    const scoredUsers = rawUsers
      .filter((user) => matchesUserFullName(user, query))
      .map((user) => ({ ...user, matchScore: scoreUser(user, query) }))
      .sort((a, b) => {
        if (a.matchScore !== b.matchScore) return b.matchScore - a.matchScore;
        const aFollowers = a.stats?.followers ?? a.followers?.length ?? 0;
        const bFollowers = b.stats?.followers ?? b.followers?.length ?? 0;
        return bFollowers - aFollowers;
      });

    const scoredPosts = rawPosts
      .map((post) => ({ ...post, matchScore: scorePost(post, query) }))
      .sort((a, b) => {
        if (a.matchScore !== b.matchScore) return b.matchScore - a.matchScore;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

    const scoredBlogs = rawBlogs
      .map((blog) => ({ ...blog, matchScore: scoreBlog(blog, query) }))
      .sort((a, b) => {
        if (a.matchScore !== b.matchScore) return b.matchScore - a.matchScore;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

    const usersPage = paginateArray(scoredUsers, page, pageLimit);
    const postsPage = paginateArray(scoredPosts, page, pageLimit);
    const blogsPage = paginateArray(scoredBlogs, page, pageLimit);

    const activePage =
      activeType === 'posts' ? postsPage : activeType === 'blogs' ? blogsPage : usersPage;

    const formatUsers = (items) =>
      items.map(({ matchScore, followers, preferences, ...user }) =>
        formatSearchUser(user, followingSet, currentUserId),
      );

    const formatPosts = (items) =>
      items.map(({ matchScore, ...post }) => formatSearchPost(post));

    const formatBlogs = (items) =>
      items.map(({ matchScore, ...blog }) => formatSearchBlog(blog));

    if (isPreview) {
      return res.status(200).json({
        success: true,
        query,
        preview: true,
        results: {
          users: formatUsers(scoredUsers.slice(0, 5)),
          posts: formatPosts(scoredPosts.slice(0, 3)),
          blogs: formatBlogs(scoredBlogs.slice(0, 3)),
        },
        totals: {
          users: scoredUsers.length,
          posts: scoredPosts.length,
          blogs: scoredBlogs.length,
        },
      });
    }

    return res.status(200).json({
      success: true,
      query,
      type: activeType,
      results: {
        users: activeType === 'users' ? formatUsers(usersPage.items) : [],
        posts: activeType === 'posts' ? formatPosts(postsPage.items) : [],
        blogs: activeType === 'blogs' ? formatBlogs(blogsPage.items) : [],
      },
      totals: {
        users: scoredUsers.length,
        posts: scoredPosts.length,
        blogs: scoredBlogs.length,
      },
      pagination: {
        page: activePage.page,
        limit: activePage.limit,
        total: activePage.total,
        totalPages: activePage.totalPages,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { search };
