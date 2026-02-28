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

exports.getMyPost = async(req,res)=>{
    try {
        const userId = req.user.id;
       const posts = await Post.find({ user: userId })
            .populate("user", "name username avatar") // optional: show user info
            .sort({ createdAt: -1 }); //latest post
           if(posts.length() < 0){
            return res.status(200).json({
                sucess:"ok",
                totalCount:posts.length(),
                message:"no post available"
            })
           }

            return res.status(200).json({
                sucess:"ok",
                totalCount:posts.length(),
                posts
            })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch posts",
            error: error.message
        });
    }

}

exports.getPostDetails = async (req,res)=>{

    const postId = req.params.postId;
    const post = await Post.findById({id:postId})
    if(!post){
        return res.status(400).json({
            sucess:"ok",
            message:"post not found "
        })
    }

    return  res.status(200).json({
            sucess:"ok",
            post:post
        })
}