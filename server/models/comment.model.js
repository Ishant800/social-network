const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    username: String,
    avatar: String
  },

  content: { type: String, required: true },

  target: {
    type: {
      type: String,
      enum: ["Post", "Blog"],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "target.type"
    }
  },

  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null
  },

  stats: {
    likes: { type: Number, default: 0 }
  }

}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
