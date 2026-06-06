const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true,
    select: false
  },


  profile: {

    fullName: {
      type: String,
      trim: true
    },

    bio: {
      type: String,
      maxlength: 300
    },

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

    posts: {
      type: Number,
      default: 0
    },

    blogs: {
      type: Number,
      default: 0
    },

    followers: {
      type: Number,
      default: 0
    },

    following: {
      type: Number,
      default: 0
    }
  },



  preferences: {

    interests: [
      {
        type: String
      }
    ]
  },

  interestScores: {
    type: Map,
    of: Number,
    default: {}
  },


  contentPreferences: {

    posts: {
      type: Number,
      default: 50
    },

    blogs: {
      type: Number,
      default: 50
    }
  },

  

  privacy: {

    isPrivate: {
      type: Boolean,
      default: false
    },

    discoverable: {
      type: Boolean,
      default: true
    }
  },



  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  // ==================================
  // CHAT
  // ==================================

  chatList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  lastSeen: {
    type: Date,
    default: Date.now
  },

  // ==================================
  // ACCOUNT STATUS
  // ==================================

  status: {
    type: String,
    enum: [
      "active",
      "suspended",
      "deleted"
    ],
    default: "active"
  }

},
{
  timestamps: true
});

module.exports = mongoose.model("User", UserSchema);