const mongoose = require('mongoose');

const BlogLikeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  blogId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Blog', 
    required: true,
    index: true 
  }
}, { timestamps: true });

// Ensure one like per user per blog
BlogLikeSchema.index({ userId: 1, blogId: 1 }, { unique: true });

module.exports = mongoose.model('BlogLike', BlogLikeSchema);
