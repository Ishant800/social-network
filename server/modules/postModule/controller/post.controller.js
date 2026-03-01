const Post = require("../models/post.entity")
const cloudinary = require("cloudinary").v2;

//post create
exports.createPost = async (req,res)=>{
    try {
        const userId = req.params.id;
        const {content,media,tags,isPublic} = req.body;

        //postimages 
        let mediaUrls = [];
        if(req.files && req.files.length > 0){
            mediaUrls = req.files.map(file => file.path)
        }
        //create post
        const post = await Post.create({
            user:userId,
            content,
            media:mediaUrls,
            tags: tags ? tags.split(",") : [],
            isPublic : isPublic !== undefined ? isPublic : true
        });
          
         if(!post) return res.status(400).json({
            sucess:false,
          error:"failed to create post"
        })

        //populate user info
        const populatedPost = await Post.findById(post._id).populate("user", "name profileImage");

   
    return res.status(201).json({
          sucess:true,
        message:"post create sucessfully",
        post: populatedPost
    })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message: error.message
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
    const post = await Post.findById(postId)
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

exports.updatePost = async () =>{

    try {
       const userId = req.user.id;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if(!post){
        return res.status(404).json({
            success:false,
            message:"post not found"
        })
    }

    // ownership check user is owner or not
    if(post.user.toString() !== userId){
        return res.status(203).json({
            sucess:false,
            message:"Unauthorized  to update this post"
        })
    }

    // update fields
    if(req.body.content) post.content = req.body.content;
    if(req.body.tags) post.tags = req.body.tags;
    if(req.body.isPublic !== undefined) post.isPublic = req.body.isPublic;
    
    
    // media replacement
    if(req.files && req.files.length > 0){
        if(post.media.length > 0){
            for(let url of post.media){
                const publicId = url.split("/").split(".")[0];
                await cloudinary.uploader.destroy(`meroroom/${publicId}`);
            }
        }
        post.media = req.files.map(file => file.path);

    }

    await post.save();
     res.status(200).json({
            success: true,
            message: "Post updated successfully",
            post
        });

    } catch (error) {
         res.status(500).json({
            success: false,
            message: error.message
        });
    }
    
}