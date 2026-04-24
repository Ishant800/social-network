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


