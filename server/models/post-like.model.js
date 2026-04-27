const mongoose = require('mongoose');

// Post reactions support 6 different reaction types
// Blogs use a separate BlogLike model with simple like/unlike only
const REACTION_TYPES = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];

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
  },
  reactionType: {
    type: String,
    enum: REACTION_TYPES,
    default: 'like'
  }
}, { timestamps: true });

PostLikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model('PostLike', PostLikeSchema);
module.exports.REACTION_TYPES = REACTION_TYPES;
