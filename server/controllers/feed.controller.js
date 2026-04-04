const mongoose = require('mongoose');
const Post = require('../models/post.model');
const Blog = require('../models/blogs.model');

function normalizePostDoc(post) {
  const postData = post.toObject ? post.toObject() : { ...post };
  postData.id = postData._id;
  postData.feedType = 'post';
  if (postData.user) {
    postData.user.name = postData.user.profile?.fullName || postData.user.username;
    postData.user.profileImage = postData.user.profile?.avatar || null;
  }
  return postData;
}

function normalizeBlogDoc(blog) {
  const b = blog.toObject ? blog.toObject() : { ...blog };
  return {
    ...b,
    _id: b._id,
    id: b._id,
    feedType: 'blog',
    createdAt: b.createdAt,
    user: {
      _id: b.author?._id,
      username: b.author?.username,
      name: b.author?.username,
      profileImage: b.author?.avatar ? { url: b.author.avatar } : null,
    },
    content: b.summary || b.content?.body || '',
    media: b.coverImage?.url ? [{ url: b.coverImage.url }] : [],
    tags: b.tags || [],
    likesCount: b.stats?.likes || 0,
    commentsCount: b.stats?.comments || 0,
  };
}

function encodeCursor(item) {
  if (!item?._id || !item.createdAt) return null;
  const payload = {
    d: new Date(item.createdAt).toISOString(),
    id: String(item._id),
  };
  return Buffer.from(JSON.stringify(payload), 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function decodeCursor(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    let b64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const json = Buffer.from(b64, 'base64').toString('utf8');
    const payload = JSON.parse(json);
    if (!payload.d || !payload.id) return null;
    const at = new Date(payload.d);
    if (Number.isNaN(at.getTime()) || !mongoose.Types.ObjectId.isValid(payload.id)) return null;
    return { at, id: new mongoose.Types.ObjectId(payload.id) };
  } catch {
    return null;
  }
}

function cursorFilter(cursor) {
  if (!cursor) return {};
  return {
    $or: [{ createdAt: { $lt: cursor.at } }, { createdAt: cursor.at, _id: { $lt: cursor.id } }],
  };
}

/**
 * Authenticated home feed: public posts + published blogs, cursor-paginated, merged by time.
 */
async function getHomeFeed(req, res) {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 15, 1), 30);
    const cursor = decodeCursor(req.query.cursor);

    const postQuery = { isPublic: true, ...cursorFilter(cursor) };
    const blogQuery = { status: 'published', ...cursorFilter(cursor) };

    const [posts, blogs] = await Promise.all([
      Post.find(postQuery)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit)
        .populate('user', 'username profile.fullName profile.avatar')
        .lean(),
      Blog.find(blogQuery).sort({ createdAt: -1, _id: -1 }).limit(limit).lean(),
    ]);

    const normalized = [
      ...posts.map((p) => normalizePostDoc(p)),
      ...blogs.map((bl) => normalizeBlogDoc(bl)),
    ];

    normalized.sort((a, b) => {
      const tb = new Date(b.createdAt || 0).getTime();
      const ta = new Date(a.createdAt || 0).getTime();
      if (tb !== ta) return tb - ta;
      return String(b._id).localeCompare(String(a._id));
    });

    const page = normalized.slice(0, limit);
    const last = page[page.length - 1];
    const nextCursor = page.length === limit && last ? encodeCursor(last) : null;

    return res.status(200).json({
      success: true,
      items: page,
      nextCursor,
      hasMore: Boolean(nextCursor),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load feed',
    });
  }
}

module.exports = { getHomeFeed };
