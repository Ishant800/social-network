const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({

  author:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  title:{
    type:String,
    required:true
  },

  slug:{
    type:String,
    unique:true
  },

  summary:{
    type:String,
    maxlength:500
  },

  coverImage:{
    url:String,
    public_id:String
  },

  category:{
    type:String,
    index:true
  },

  tags:[String],

  // TipTap JSON
  content:{
    type:Object,
    required:true
  },

  readTime:Number,

  stats:{
    views:{
      type:Number,
      default:0
    },

    likes:{
      type:Number,
      default:0
    },

    comments:{
      type:Number,
      default:0
    },

    bookmarks:{
      type:Number,
      default:0
    },

    shares:{
      type:Number,
      default:0
    }
  },

  engagementScore:{
    type:Number,
    default:0
  },

  status:{
    type:String,
    enum:[
      "draft",
      "published"
    ],
    default:"draft"
  },

  publishedAt:Date

},{
  timestamps:true
});

module.exports = mongoose.model('Blog', BlogSchema);
