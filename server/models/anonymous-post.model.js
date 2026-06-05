const mongoose = require('mongoose');

const anonymousPostSchema = mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
      required: true,
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
    isPublic: {
      type: Boolean,
      default: true,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    reactions: {
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      haha: { type: Number, default: 0 },
      wow: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
    },
    tags: [{ type: String }],
  },
  { timestamps: true },
);

anonymousPostSchema.index({ createdAt: -1, isPublic: 1 });
anonymousPostSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('AnonymousPost', anonymousPostSchema);
