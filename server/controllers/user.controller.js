const mongoose = require('mongoose');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const { cloudinary } = require('../config/cloudinary.config');
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
    const getme = await User.findById(userid)
      .select('-password')
      .populate('followers', '_id username profile.fullName profile.avatar')
      .populate('following', '_id username profile.fullName profile.avatar');
      
    if(!getme){
      return res.status(400).json({
        sucess:false,
        message:"user not found"
      })
    }

    // Check if profile is incomplete
    const isProfileIncomplete = checkProfileCompleteness(getme);
    
    // If profile is incomplete, send notification (only once per day)
    if (isProfileIncomplete) {
      await sendProfileIncompleteNotification(userid);
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

// Helper function to check if profile is incomplete
function checkProfileCompleteness(user) {
  const profile = user.profile || {};
  
  // Only check essential fields - fullName and avatar
  const hasFullName = profile.fullName && profile.fullName.trim() !== '';
  const hasAvatar = profile.avatar && profile.avatar.url;
  
  // Profile is incomplete if missing either essential field
  return !hasFullName || !hasAvatar;
}

// Helper function to send profile incomplete notification
async function sendProfileIncompleteNotification(userId) {
  try {
    // Check if we already sent this notification today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingNotification = await Notification.findOne({
      recipient: userId,
      type: 'profile_incomplete',
      createdAt: { $gte: today }
    });
    
    // Only send if we haven't sent one today
    if (!existingNotification) {
      await pushNotification({
        recipient: userId,
        actor: userId,
        type: 'profile_incomplete',
        message: 'Complete your profile! Add your full name and profile picture to get started.'
      });
    }
  } catch (error) {
    console.error('Error sending profile incomplete notification:', error);
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

     await owner.save();
     await target.save();

     // Notify the followed user
     pushNotification({ recipient: userId, actor: ownerId, type: 'follow' });
    }

   return res.status(200).json({
    success: true,
    message: "Following user"
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

      await owner.save();
      await target.save();
    }

    res.json({
      success: true,
      message: "Unfollowed user"
    })
  } catch (error) {
     return res.status(500).json({
      error:'server error'
    })
  }
}

// Get user's followers list
async function getFollowers(req, res) {
  try {
    const userId = req.params.userId || req.user.id;
    
    if (req.params.userId && !mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id'
      });
    }
    
    const user = await User.findById(userId)
      .populate('followers', '_id username profile.fullName profile.avatar profile.bio')
      .select('followers');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      followers: user.followers || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Get user's following list
async function getFollowing(req, res) {
  try {
    const userId = req.params.userId || req.user.id;
    
    if (req.params.userId && !mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id'
      });
    }
    
    const user = await User.findById(userId)
      .populate('following', '_id username profile.fullName profile.avatar profile.bio')
      .select('following');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      following: user.following || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Get any user's profile by ID
async function getUserProfile(req, res) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id'
      });
    }
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('followers', '_id username profile.fullName profile.avatar')
      .populate('following', '_id username profile.fullName profile.avatar');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user's posts
    const posts = await postModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(40)
      .select('content media createdAt likesCount commentsCount isPublic tags title coverImage')
      .lean();
    
    // Check if current user is following this user
    const isFollowing = user.followers.some(
      follower => String(follower._id) === String(currentUserId)
    );
    
    res.json({
      success: true,
      user,
      posts,
      isFollowing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = { updateProfile, getMe, getSuggestions, followUser, unfollowuser, getFollowers, getFollowing, getUserProfile };
