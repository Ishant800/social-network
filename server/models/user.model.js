const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

  // ==================================
  // AUTH
  // ==================================

  username: {
    type: String,
<<<<<<< Updated upstream
     required: true,
      unique: true ,
    }, 

  password: { 
    type: String,
     required: true,
    select: false },
=======
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

  // ==================================
  // PROFILE
  // ==================================
>>>>>>> Stashed changes

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

  // ==================================
  // STATS
  // ==================================

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

  // ==================================
  // INTERESTS
  // ==================================

  preferences: {

    interests: [
      {
        type: String
      }
    ]
  },
<<<<<<< Updated upstream
  chatList:[{
    type:mongoose.Schema.Types.ObjectId,ref:"User"
  }],
  lastSeen:{
    type:Date,
=======

  // Dynamic ranking scores

  interestScores: {
    type: Map,
    of: Number,
    default: {}
  },

  // ==================================
  // FEED PREFERENCES
  // ==================================

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

  // ==================================
  // PRIVACY
  // ==================================

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

  // ==================================
  // SOCIAL GRAPH
  // ==================================

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
>>>>>>> Stashed changes
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