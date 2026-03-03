const Comment = require("../comment.entity")
const Post = require("../../postModule/models/post.entity")
exports.createComment = async(req,res)=>{

    try {
        const userId = req.user.id;
        const postId = req.params.postId;
        const {text} = req.body
 
        if(!text) return res.status(400).json({
            sucess:false,
            message:"comment text is required"
        })

        const postExists = await Post.findById(postId);
        if (!postExists) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }
        const comment = await Comment.create({
            post: postId,
            user: userId,
            text
        });

        // also update the commentcount value in post entity
        await Post.findByIdAndUpdate(
            postId,
            {$inc : {commentsCount: 1}}
        )

        const populatedComment = await Comment.findById(comment._id).populate("user","name profileImage");

        return res.status(201).json({
            sucess:true,
            message:"comment created sucessfully",
            comment:populatedComment
        })


    } catch (error) {
        return res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}

exports.getPostComments = async(req,res)=>{
    try {
        const postId = req.params.postId;

        const comments = await Comment.find({ post: postId })
            .populate("user", "name profileImage")
            .sort({ createdAt: -1 })

           return res.status(200).json({
            success: true,
           
            comments
        });
        
    } catch (error) {
        return res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}


exports.deleteComment = async (req,res)=>{
    try {
      const userId = req.user.id;
        const commentId = req.params.commentId;
        
        const comment = await Comment.findById(commentId);
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

         // only comment owner can delete
        if (comment.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }
         await Comment.findByIdAndDelete(commentId);

        // decrease comment count
        await Post.findByIdAndUpdate(
            comment.post,
            { $inc: { commentsCount: -1 } }
        );

        return res.status(200).json({
            success: true,
            message: "Comment deleted sucessfully"
        });
    } catch (error) {
        return res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}