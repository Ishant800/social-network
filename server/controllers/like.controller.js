 const Like = require("../models/postlike.model")
 const Post = require("../models/post.model")
  
 async function postLike(req, res){
  try {
    const  postId  = req.params.postId;
    const userId = req.user.id; 

    if (!postId) {
      return res.status(400).json({ msg: 'Post ID is required' });
    }

    const existingLike = await Like.findOne({
      userId,
      'target.type': 'Post',
      'target.id': postId,
    });

    if (existingLike) {
      return res.status(200).json({ msg: 'Post already liked' });
    }

    await Like.create({
      userId,
      target: {
        type: 'Post',
        id: postId,
      },
    });

    await Post.findOneAndUpdate({_id:postId},{
        $inc:{
            likesCount: 1
        }
        
    },{new:true})
    return res.status(200).json({ msg: 'Post liked successfully' });
  } catch (err) {
    console.error(err.message);
   return  res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function unLike(req, res){
  try {
     const  postId  = req.params.postId;
    const userId = req.user.id;

    if (!postId) {
      return res.status(400).json({ msg: 'Post ID is required' });
    }

    const like = await Like.deleteOne({
      userId,
      'target.type': 'Post',
      'target.id': postId,
    });

    // If no record was found, it means they never liked it
    if (!like.deletedCount) {
      return res.status(404).json({ msg: 'Like record not found' });
    }
    await Post.findOneAndUpdate( { _id: postId },{
        $inc:{
            likesCount: -1
        }
    })
    return res.status(200).json({ msg: 'Post unliked successfully', like });
  } catch (err) {
    console.error(err.message);
   return res.status(500).send('Server Error');
  }
};

module.exports={
    postLike,unLike
}
