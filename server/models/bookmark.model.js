const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema(
  {
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    post:   { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    blog:   { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
    type:   { type: String, enum: ['Post', 'Blog'], required: true },
  },
  { timestamps: true }
);

// One bookmark per user per item
BookmarkSchema.index({ user: 1, post: 1 }, { unique: true, sparse: true });
BookmarkSchema.index({ user: 1, blog: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Bookmark', BookmarkSchema);
