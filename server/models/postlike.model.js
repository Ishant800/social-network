const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  target: {
    type: {
      type: String,
      enum: ["Post", "Blog", "Comment"],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "target.type"
    }
  }

}, { timestamps: true });

LikeSchema.index({ userId: 1, "target.type": 1, "target.id": 1 }, { unique: true });

module.exports = mongoose.model('Like', LikeSchema);
