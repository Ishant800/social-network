const mongoose = require('mongoose');

const PostLikeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  postId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true,
    index: true 
  }
}, { timestamps: true });

// Ensure one like per user per post
PostLikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model('PostLike', PostLikeSchema);
