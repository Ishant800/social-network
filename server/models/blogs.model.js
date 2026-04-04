const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  author: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    username: String,
    avatar: String
  },

  title: { type: String, required: true },
  slug: { type: String, unique: true },

  content: {
    body: { type: String, required: true }, 
    toc: [String] // table of contents headings
  },

  summary: { type: String, maxlength: 500 },

  coverImage: {
    url: String,
    public_id: String
  },

  category: {
    name: String,
    slug: String
  },

  tags: [String],

  readTime: Number,

  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 }
  },

  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft"
  },

  isFeatured: { type: Boolean, default: false },

  publishedAt: Date

}, { timestamps: true });

BlogSchema.index({ status: 1, createdAt: -1, _id: -1 });

module.exports = mongoose.model('Blog', BlogSchema);
