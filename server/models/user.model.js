const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  profile: {
    fullName: String,
    bio: { type: String, maxlength: 300 },
    avatar: {
      url: String,
      public_id: String
    },
    coverImage: {
      url: String,
      public_id: String
    },
    location: String,
    website: String
  },

  stats: {
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    posts: { type: Number, default: 0 },
    blogs: { type: Number, default: 0 }
  },

  preferences: {
    interests: [String],
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },

  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);


