const mongoose = require("mongoose");

<<<<<<< Updated upstream
const postSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
     media: [
      {
        url: String,
        public_id: String,
      }
    ],
    
    
    tags: [{ type: String }],
    isPublic: {
      type: Boolean,
      default: true,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    likesCount:{
        type:Number,
        default: 0
    },
    reactions: {
      like:  { type: Number, default: 0 },
      love:  { type: Number, default: 0 },
      haha:  { type: Number, default: 0 },
      wow:   { type: Number, default: 0 },
      sad:   { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
    }
=======
const PostSchema = new mongoose.Schema({

  author:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
    index:true
>>>>>>> Stashed changes
  },

<<<<<<< Updated upstream
postSchema.index({ createdAt: -1, isPublic: 1 });
postSchema.index({ user: 1, createdAt: -1 });
=======
  content:{
    type:String,
    required:true,
    trim:true,
    maxlength:2000
  },
>>>>>>> Stashed changes

  media:[
    {
      url:String,
      public_id:String,

      type:{
        type:String,
        enum:["image","video"]
      }
    }
  ],

  category:{
    type:String,
    required:true,
    index:true
  },

  tags:[String],

  visibility:{
    type:String,
    enum:[
      "public",
      "followers",
      "private"
    ],
    default:"public"
  },

  stats:{

    views:{
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

  // Facebook style reactions

  reactions:{

    like:{
      type:Number,
      default:0
    },

    love:{
      type:Number,
      default:0
    },

    haha:{
      type:Number,
      default:0
    },

    wow:{
      type:Number,
      default:0
    },

    sad:{
      type:Number,
      default:0
    },

    angry:{
      type:Number,
      default:0
    }
  },

  totalReactions:{
    type:Number,
    default:0
  },
hotScore:{
   type:Number,
   default:0
},
  engagementScore:{
    type:Number,
    default:0
  },

  status:{
    type:String,
    enum:[
      "active",
      "hidden",
      "deleted"
    ],
    default:"active"
  }

},{
  timestamps:true
});

PostSchema.index({ createdAt:-1 });
PostSchema.index({ category:1, createdAt:-1 });
PostSchema.index({ author:1, createdAt:-1 });
PostSchema.index({ engagementScore:-1 });

module.exports = mongoose.model("Post", PostSchema);