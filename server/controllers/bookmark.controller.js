const Bookmark = require('../models/bookmark.model');
const Post     = require('../models/post.model');
const Blog     = require('../models/blogs.model');

// POST /bookmark/:itemId  — toggle bookmark (add or remove)
const toggleBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const type = req.query.type === 'Blog' ? 'Blog' : 'Post';

    const query = { user: userId, type };
    if (type === 'Post') query.post = itemId;
    else                 query.blog = itemId;

    const existing = await Bookmark.findOne(query);

    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, bookmarked: false, message: 'Bookmark removed' });
    }

    // Verify the item exists
    const exists = type === 'Post'
      ? await Post.exists({ _id: itemId })
      : await Blog.exists({ _id: itemId });

    if (!exists) return res.status(404).json({ success: false, error: 'Item not found' });

    const bookmark = await Bookmark.create(query);
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
        select: 'content media tags createdAt user likesCount commentsCount',
        populate: { path: 'user', select: 'username name profile' },
      })
      .populate({
        path: 'blog',
        select: 'title summary coverImage category readTime publishedAt author stats',
        populate: { path: 'author', select: 'username name profile' },
      });

    // Flatten into a unified list and attach feedType for PostCard
    const items = bookmarks.map((b) => {
      if (b.type === 'Post' && b.post) {
        return { ...b.post.toObject(), feedType: 'post', bookmarkId: b._id };
      }
      if (b.type === 'Blog' && b.blog) {
        return { ...b.blog.toObject(), feedType: 'blog', bookmarkId: b._id };
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
