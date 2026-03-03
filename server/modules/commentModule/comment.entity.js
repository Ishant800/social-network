const mongoose = require('mongoose')
const commentSchema = mongoose.Schema({
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    text:{
        type:String,
        required:true,
        trim: true,
        maxlength: 500
    }
},{timstamps: true})

module.exports = mongoose.model("comment",commentSchema)
