const mongoose = require('mongoose');

const postSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    media: [
      {
        type: String,
      },
    ],
    
    sharedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    tags: [{ type: String }],
    isPublic: {
      type: Boolean,
      default: true,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    likesCount:{
        type:Number,
        default: 0
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model('Post', postSchema);
