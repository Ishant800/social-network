const mongoose = require("mongoose")

const postSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    content:{
        type:String,
        required: true,
        trim:true
    },
    // url of image and video
    media:[{
    type:String
    }],
   likes:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
   }],
   sharedFrom:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Post",
    default:null
   },
   tags:[{type:String}],
   //users able to make their post public or private 
   isPublic:{
    type:Boolean,default:true
   }

},{timestamps: true})


module.exports = mongoose.model("Post",postSchema)