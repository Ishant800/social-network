const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
     type: String,
     required: true, 
     unique: true, 
     trim: true },

  email: { 
    type: String,
     required: true,
      unique: true ,
    }, 

  password: { 
    type: String,
     required: true,
    select: false },

  emailVerified: { type: Boolean, default: false },

  emailVerification: {
    codeHash: { type: String, select: false },
    expiresAt: { type: Date },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date },
  },

  passwordReset: {
    codeHash: { type: String, select: false },
    expiresAt: { type: Date },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date },
  },

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
    location: String
  },

  stats: {
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

  privacy: {
    isPrivate: { type: Boolean, default: false },
    discoverable: { type: Boolean, default: true },
  },
  chatList:[{
    type:mongoose.Schema.Types.ObjectId,ref:"User"
  }],
  lastSeen:{
    type:Date,
    default: Date.now
  },

  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],



}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);


