const mongoose = require('mongoose');

const postSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: {
      type: String,
      trim: true,
      required: function requiredContent() {
        return !this.voice?.url;
      },
    },
    voice: {
      url: String,
      public_id: String,
      duration: { type: Number, default: 0 },
    },
    isVoicePost: {
      type: Boolean,
      default: false,
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
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      default: null,
    },
    anonymousPersona: {
      name: String,
      avatarColor: String,
      animal: String,
    },
  },
  { timestamps: true },
);

postSchema.index({ createdAt: -1, isPublic: 1 });
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ isAnonymous: 1, createdAt: -1 });
postSchema.index({ isAnonymous: 1, category: 1, createdAt: -1 });
postSchema.index({ isAnonymous: 1, isVoicePost: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
