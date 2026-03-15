const mongoose = require('mongoose');
const likeSchema = mongoose.Schema({
  // Reference to the User model
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Reference to the Post model
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true  
  },
  // Boolean status: true = Liked, false = Unliked/Removed
  isLike: {
    type: Boolean,
    default: false,
    required: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});


likeSchema.index({ user: 1, post: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);