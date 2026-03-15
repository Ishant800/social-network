 const Like = require("../models/postlike.model")
 const Post = require("../models/post.model")
  
 async function postLike(req, res){
  try {
    const  postId  = req.params.postId;
    const userId = req.user.id; 

    if (!postId) {
      return res.status(400).json({ msg: 'Post ID is required' });
    }

    // Use upsert: true. If record exists, update isLike to true. 
    // If not, create a new record.
     await Like.findOneAndUpdate(
      { user: userId, post: postId },
      { isLike: true },
      { upsert: true, new: true } // 'new: true' returns the updated document
    );

    await Post.findOneAndUpdate({_id:postId},{
        $inc:{
            likesCount: 1
        }
        
    },{new:true})
    return res.status(200).json({ msg: 'Post liked successfully' });
  } catch (err) {
    console.error(err.message);
   return  res.status(500).json("Internal server error", err.message);
  }
}

async function unLike(req, res){
  try {
     const  postId  = req.params.postId;
    const userId = req.user.id;

    if (!postId) {
      return res.status(400).json({ msg: 'Post ID is required' });
    }

    // Find the record and set isLike to false
    const like = await Like.deleteOne({ user: userId, post: postId });

    // If no record was found, it means they never liked it
    if (!like) {
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
