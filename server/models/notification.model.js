const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actor:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:      {
      type: String,
      enum: ['like', 'comment', 'follow'],
      required: true,
    },
    // Optional references
    post:      { type: mongoose.Schema.Types.ObjectId, ref: 'Post',    default: null },
    blog:      { type: mongoose.Schema.Types.ObjectId, ref: 'Blog',    default: null },
    comment:   { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    read:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
