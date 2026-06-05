const mongoose = require('mongoose');

const anonymousCommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },

  target: {
    type: {
      type: String,
      enum: ['AnonymousPost'],
      required: true,
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'AnonymousPost',
    },
  },

  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnonymousComment',
    default: null,
  },

  anonymousPersona: {
    name: String,
    avatarColor: String,
    animal: String,
  },

  stats: {
    likes: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('AnonymousComment', anonymousCommentSchema);
