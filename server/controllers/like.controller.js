const mongoose = require('mongoose');
const Like = require('../models/postlike.model');
const Post = require('../models/post.model');
const { pushNotification } = require('./notification.controller');
 async function postLike(req, res) {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    if (!postId) {
      return res.status(400).json({ msg: 'Post ID is required' });
    }

    const postExists = await Post.findById(postId);
    if (!postExists) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    try {
      await Like.create({
        userId,
        target: {
          type: "Post",
          id: postId
        }
      });

      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

      // Notify post owner
      pushNotification({
        recipient: postExists.user,
        actor:     userId,
        type:      'like',
        post:      postId,
      });

      return res.status(200).json({ msg: 'Post liked successfully' });

    } catch (err) {
      //  duplicate like handled here
      if (err.code === 11000) {
        return res.status(200).json({ msg: "Post already liked" });
      }
      throw err;
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message || "Internal server error"
    });
  }
}

 const unLike = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

   
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ msg: "Valid post ID is required" });
    }

   
    const deleted = await Like.findOneAndDelete({
      userId,
      "target.type": "Post",
      "target.id": postId,
    });

    
    if (!deleted) {
      return res.status(404).json({ msg: "Like not found" });
    }


    await Post.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: -1 } },
      { new: true }
    );

    return res.status(200).json({
      msg: "Post unliked successfully",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message || "Internal server error",
    });
  }
};

module.exports={
    postLike,unLike
}
