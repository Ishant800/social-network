const Post = require("../models/post.entity")


//post create
exports.createPost = async (req,res)=>{
    try {
        const postsaved = await Post.create(req.body)
    if(!postsaved) return res.status(400).json({
      error:"failed to create post"
    })
    return res.status(201).json({
          sucess:"ok",
        message:"post create sucessfully"
    })

    } catch (error) {
        return res.status(501).json({
            error:"Internal Server error"
        })
    }
    
}