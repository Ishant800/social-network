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
        url: String,
        public_id: String,
      }
    ],
    
    
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
    },
    reactions: {
      like:  { type: Number, default: 0 },
      love:  { type: Number, default: 0 },
      haha:  { type: Number, default: 0 },
      wow:   { type: Number, default: 0 },
      sad:   { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
    }
  },
  { timestamps: true },
);

postSchema.index({ createdAt: -1, isPublic: 1 });
postSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
