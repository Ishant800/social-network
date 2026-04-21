const mongoose = require('mongoose');
const User = require('../models/user.model');
const { cloudinary } = require('../config/cloudinary.config');
const blogsModel = require('../models/blogs.model');
const postModel = require('../models/post.model');
const { pushNotification } = require('./notification.controller');


const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    
    if (!user.profile) {
      user.profile = {};
    }

   
    if (req.body.fullName) {
      user.profile.fullName = req.body.fullName;
    }

    if (req.body.bio) {
      user.profile.bio = req.body.bio;
    }

    if (req.body.location) {
      user.profile.location = req.body.location;
    }

    
    if (req.file) {
      if (user.profile?.avatar?.public_id) {
        await cloudinary.uploader.destroy(user.profile.avatar.public_id);
      }

      user.profile.avatar = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



 async function getMe (req,res){
  try {
    const userid = req.user.id;
    const getme = await User.findById(userid).select('-password');
    if(!getme){
      return res.status(400).json({
        sucess:false,
        message:"user not found"
      })
    }
    const post = await postModel
      .find({ user: userid })
      .sort({ createdAt: -1 })
      .limit(40)
      .select('content media createdAt likesCount commentsCount isPublic tags')
      .lean();
    res.status(200).json({
      getme,
      post,
    });
  } catch (error) {
    return res.status(500).json({
      success:false,
      error:error.message
    })
  }
}

async function getSuggestions(req, res) {
  try {
    const user = await User.findById(req.user.id).select('following');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const following = Array.isArray(user.following) ? user.following : [];
    const selfId = req.user.id;
    const excludeIds = [...following, selfId];

    // Removed limit - get all suggestions
    const suggestions = await User.find({
      _id: { $nin: excludeIds },
    })
      .select('-password')
      .populate('followers', 'username')
      .lean();

    // Add online status if you have it
    const suggestionsWithStatus = suggestions.map(suggestion => ({
      ...suggestion,
      isOnline: false // You can set this from your socket active users
    }));

    return res.status(200).json({
      success: true,
      data: suggestionsWithStatus
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}


async function followUser(req,res){
  try {
    const ownerId = req.user.id;
   const {userId} = req.params;

   if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user id',
    });
   }

   if (ownerId === userId) {
    return res.status(400).json({
      success: false,
      message: 'You cannot follow yourself',
      });
   }

   const owner = await User.findById(ownerId);
   const target = await User.findById(userId);

   if (!owner || !target) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
   }

   const alreadyFollowing = owner.following.some(
    (id) => id.toString() === userId,
   );

    if (!alreadyFollowing) {
     owner.following.push(userId);
     target.followers.push(ownerId);
     owner.stats.following += 1;
     target.stats.followers += 1;

     await owner.save();
     await target.save();

     // Notify the followed user
     pushNotification({ recipient: userId, actor: ownerId, type: 'follow' });
    }

   return res.status(200).json({
    message:"following user"
   })

  } catch (error) {
    return res.status(500).json({
      error:'server error'
    })
  }
}

// unfolw user
async function unfollowuser (req,res){
  try {
    const {userId} = req.params;
    const ownerId = req.user.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id',
      });
    }

    const owner = await User.findById(ownerId);
    const target = await User.findById(userId);

    if (!owner || !target) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isFollowing = owner.following.some(
      (id) => id.toString() === userId,
    );

    if (isFollowing) {
      owner.following.pull(userId);
      target.followers.pull(ownerId);

      if (owner.stats.following > 0) owner.stats.following -= 1;
      if (target.stats.followers > 0) target.stats.followers -= 1;

      await owner.save();
      await target.save();
    }

    res.json({
      message:"unfollowed users "
    })
  } catch (error) {
     return res.status(500).json({
      error:'server error'
    })
  }
}
module.exports = { updateProfile ,getMe,getSuggestions,followUser,unfollowuser};
