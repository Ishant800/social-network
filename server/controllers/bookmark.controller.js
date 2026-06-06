const Bookmark = require('../models/bookmark.model');
const Post     = require('../models/post.model');
const Blog     = require('../models/blogs.model');

const normalizeBookmarkType = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'blog' ? 'Blog' : 'Post';
};

// POST /bookmark/:itemId  — toggle bookmark (add or remove)
const toggleBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const type = normalizeBookmarkType(req.query.type);

    const query = { user: userId, type };
    if (type === 'Post') query.post = itemId;
    else                 query.blog = itemId;

    const existing = await Bookmark.findOne(query);

    if (existing) {
      await existing.deleteOne();
      const Model = type === 'Post' ? Post : Blog;
      await Model.findByIdAndUpdate(itemId, { $inc: { 'stats.bookmarks': -1 } });
      return res.json({ success: true, bookmarked: false, message: 'Bookmark removed' });
    }

    // Verify the item exists
    const exists = type === 'Post'
      ? await Post.exists({ _id: itemId })
      : await Blog.exists({ _id: itemId });

    if (!exists) return res.status(404).json({ success: false, error: 'Item not found' });

    const bookmark = await Bookmark.create(query);
    const Model = type === 'Post' ? Post : Blog;
    await Model.findByIdAndUpdate(itemId, { $inc: { 'stats.bookmarks': 1 } });
    return res.status(201).json({ success: true, bookmarked: true, bookmark, message: 'Bookmarked' });
  } catch (err) {
    console.error('toggleBookmark error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// GET /bookmark  — list current user's bookmarks (populated)
const getBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookmarks = await Bookmark.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'post',
        select: 'content media tags createdAt author likesCount totalReactions stats',
        populate: { path: 'author', select: 'username profile.fullName profile.avatar' },
      })
      .populate({
        path: 'blog',
        select: 'title summary coverImage category readTime publishedAt author stats',
        populate: { path: 'author', select: 'username name profile' },
      });

    const normalizeAuthor = (author) => {
      if (!author) return author;
      const obj = typeof author.toObject === 'function' ? author.toObject() : author;
      return {
        ...obj,
        fullName: obj.profile?.fullName || obj.name || obj.username,
        avatar: obj.profile?.avatar?.url || obj.profile?.avatar || null,
      };
    };

    // Flatten into a unified list and attach feedType for PostCard
    const items = bookmarks.map((b) => {
      if (b.type === 'Post' && b.post) {
        const post = b.post.toObject();
        return {
          ...post,
          feedType: 'post',
          bookmarkId: b._id,
          likesCount: post.totalReactions || post.likesCount || 0,
          commentsCount: post.stats?.comments || 0,
          author: normalizeAuthor(post.author),
        };
      }
      if (b.type === 'Blog' && b.blog) {
        const blog = b.blog.toObject();
        return {
          ...blog,
          feedType: 'blog',
          bookmarkId: b._id,
          likesCount: blog.stats?.likes || 0,
          commentsCount: blog.stats?.comments || 0,
          author: normalizeAuthor(blog.author),
        };
      }
      return null;
    }).filter(Boolean);

    res.json({ success: true, bookmarks: items });
  } catch (err) {
    console.error('getBookmarks error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// GET /bookmark/ids  — return just the IDs bookmarked by the user (for UI state)
const getBookmarkIds = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookmarks = await Bookmark.find({ user: userId }).select('post blog type');
    const ids = bookmarks.map((b) => (b.type === 'Post' ? String(b.post) : String(b.blog)));
    res.json({ success: true, ids });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = { toggleBookmark, getBookmarks, getBookmarkIds };
