const mongoose = require("mongoose");

const UserInteractionSchema = new mongoose.Schema({

  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
    index:true
  },

  contentType:{
    type:String,
    enum:["post","blog"],
    required:true
  },

  contentId:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    index:true
  },

  action:{
    type:String,
    enum:[
      "view",
      "react",
      "like",
      "comment",
      "bookmark",
      "share",
      "read"
    ],
    required:true
  },

  // Only used for posts
  reactionType:{
    type:String,
    enum:[
      "like",
      "love",
      "haha",
      "wow",
      "sad",
      "angry"
    ]
  },

  category:{
    type:String,
    required:true
  },

  tags:[String],

  // Mostly for blogs
  readPercentage:{
    type:Number,
    default:0
  }

},{
  timestamps:true
});

UserInteractionSchema.index({
  user:1,
  createdAt:-1
});

UserInteractionSchema.index({
  contentId:1
});

module.exports = mongoose.model(
  "UserInteraction",
  UserInteractionSchema
);