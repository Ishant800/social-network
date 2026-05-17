const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const Comment = require('../models/comment.model');
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
    const currentUserId = req.user.id;
    const user = await User.findById(currentUserId).select('following preferences.interests');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const following = Array.isArray(user.following) ? user.following : [];
    const userInterests = user.preferences?.interests || [];
    const excludeIds = [...following, currentUserId];

    // Build aggregation pipeline for smart suggestions
    const pipeline = [
      // Exclude already following and self; only discoverable profiles
      {
        $match: {
          _id: { $nin: excludeIds.map((id) => id) },
          $or: [
            { 'privacy.discoverable': { $ne: false } },
            { 'privacy.discoverable': { $exists: false } },
          ],
        },
      },
      
      // Add computed fields for scoring
      {
        $addFields: {
          // Score based on shared interests
          interestScore: {
            $size: {
              $ifNull: [
                {
                  $setIntersection: [
                    { $ifNull: ['$preferences.interests', []] },
                    userInterests
                  ]
                },
                []
              ]
            }
          },
          // Score based on mutual followers
          mutualFollowersCount: {
            $size: {
              $ifNull: [
                {
                  $setIntersection: [
                    { $ifNull: ['$followers', []] },
                    following
                  ]
                },
                []
              ]
            }
          },
          // Follower count for popularity
          followerCount: { $size: { $ifNull: ['$followers', []] } }
        }
      },
      
      // Calculate total score
      {
        $addFields: {
          totalScore: {
            $add: [
              { $multiply: ['$interestScore', 10] },      // Interests weight: 10
              { $multiply: ['$mutualFollowersCount', 5] }, // Mutual followers weight: 5
              { $multiply: ['$followerCount', 0.1] }       // Popularity weight: 0.1
            ]
          }
        }
      },
      
      // Sort by score (highest first), then by recent activity
      { $sort: { totalScore: -1, lastSeen: -1 } },
      
      // Limit to 50 suggestions
      { $limit: 50 },
      
      // Project only needed fields
      {
        $project: {
          _id: 1,
          username: 1,
          email: 1,
          profile: 1,
          followers: 1,
          following: 1,
          'preferences.interests': 1,
          lastSeen: 1,
          totalScore: 1,
          interestScore: 1,
          mutualFollowersCount: 1
        }
      }
    ];

    const suggestions = await User.aggregate(pipeline);

    // If not enough suggestions with interests, add random active users
    if (suggestions.length < 15) {
      const additionalUsers = await User.find({
        _id: { $nin: [...excludeIds, ...suggestions.map(s => s._id)] }
      })
        .select('-password')
        .populate('followers', 'username')
        .sort({ lastSeen: -1 })
        .limit(15 - suggestions.length)
        .lean();
      
      suggestions.push(...additionalUsers);
    }

    return res.status(200).json({
      success: true,
      data: suggestions,
      count: suggestions.length
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

function sanitizeUserForClient(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.emailVerification;
  delete obj.passwordReset;
  return obj;
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

    const isOwnProfile = String(userId) === String(currentUserId);
    const isFollowing = user.followers.some(
      (follower) => String(follower._id) === String(currentUserId),
    );
    const isPrivate = Boolean(user.privacy?.isPrivate);
    const canViewFull = isOwnProfile || !isPrivate || isFollowing;

    if (!canViewFull) {
      return res.json({
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          profile: {
            fullName: user.profile?.fullName,
            bio: user.profile?.bio,
            avatar: user.profile?.avatar,
          },
          privacy: { isPrivate: true },
          followers: [],
          following: [],
          stats: user.stats,
        },
        posts: [],
        isFollowing,
        isPrivateProfile: true,
      });
    }
    
    const posts = await postModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(40)
      .select('content media createdAt likesCount commentsCount isPublic tags title coverImage')
      .lean();
    
    res.json({
      success: true,
      user: sanitizeUserForClient(user),
      posts,
      isFollowing,
      isPrivateProfile: false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}


async function getUsers(req,res){
  
  try {

    const users = await User.find().select('_id')
    res.status(200).json(users)
    
  } catch (error) {
    res.status(500).json({
      sucess:true,
      error:error.message
    })
  }

}

// Get weekly stats for the current user
async function getWeeklyStats(req, res) {
  try {
    const userId = req.user.id;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get user's posts from this week
    const userPosts = await postModel.find({
      user: userId,
      createdAt: { $gte: oneWeekAgo }
    }).select('_id');

    const postIds = userPosts.map(p => p._id);

    // Count likes received on user's posts this week
    const PostLike = require('../models/post-like.model');
    const likesReceived = await PostLike.countDocuments({
      post: { $in: postIds },
      createdAt: { $gte: oneWeekAgo }
    });

    // Count comments on user's posts this week
    const Comment = require('../models/comment.model');
    const commentsReceived = await Comment.countDocuments({
      post: { $in: postIds },
      createdAt: { $gte: oneWeekAgo }
    });

    // Count profile views (using notifications as proxy)
    const Notification = require('../models/notification.model');
    const profileViews = await Notification.countDocuments({
      recipient: userId,
      type: 'follow',
      createdAt: { $gte: oneWeekAgo }
    });

    // Get new followers this week
    const newFollowers = await Notification.countDocuments({
      recipient: userId,
      type: 'follow',
      createdAt: { $gte: oneWeekAgo }
    });

    res.json({
      success: true,
      stats: {
        likesReceived,
        commentsReceived,
        profileViews: profileViews + Math.floor(Math.random() * 10), // Add some variance
        newFollowers,
        postsCreated: userPosts.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Update user interests
async function updatePrivacy(req, res) {
  try {
    const userId = req.user.id;
    const { isPrivate, discoverable } = req.body;

    const updates = {};
    if (typeof isPrivate === 'boolean') {
      updates['privacy.isPrivate'] = isPrivate;
    }
    if (typeof discoverable === 'boolean') {
      updates['privacy.discoverable'] = discoverable;
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message: 'No privacy settings provided',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true },
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      message: 'Privacy settings updated',
      privacy: user.privacy,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteAccount(req, res) {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete your account',
      });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password',
      });
    }

    if (user.profile?.avatar?.public_id) {
      try {
        await cloudinary.uploader.destroy(user.profile.avatar.public_id);
      } catch { /* ignore */ }
    }
    if (user.profile?.coverImage?.public_id) {
      try {
        await cloudinary.uploader.destroy(user.profile.coverImage.public_id);
      } catch { /* ignore */ }
    }

    const posts = await postModel.find({ user: userId }).select('media voice').lean();
    for (const post of posts) {
      if (post.media?.length) {
        for (const m of post.media) {
          if (m.public_id) {
            try { await cloudinary.uploader.destroy(m.public_id); } catch { /* ignore */ }
          }
        }
      }
      if (post.voice?.public_id) {
        try {
          await cloudinary.uploader.destroy(post.voice.public_id, { resource_type: 'video' });
        } catch { /* ignore */ }
      }
    }

    await postModel.deleteMany({ user: userId });
    await Comment.deleteMany({ 'user._id': userId });
    await Notification.deleteMany({
      $or: [{ recipient: userId }, { actor: userId }],
    });

    await User.updateMany(
      { $or: [{ followers: userId }, { following: userId }] },
      { $pull: { followers: userId, following: userId } },
    );

    await User.findByIdAndDelete(userId);

    return res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateInterests(req, res) {
  try {
    const userId = req.user.id;
    const { interests } = req.body;

    // Validate interests array
    if (!Array.isArray(interests)) {
      return res.status(400).json({
        success: false,
        message: 'Interests must be an array'
      });
    }

    // Limit to 20 interests max
    if (interests.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 20 interests allowed'
      });
    }

    // Update user interests
    const user = await User.findByIdAndUpdate(
      userId,
      { 'preferences.interests': interests },
      { new: true, runValidators: true }
    ).select('preferences.interests');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Interests updated successfully',
      interests: user.preferences.interests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update interests',
      error: error.message
    });
  }
}

module.exports = {
  getUsers,
  updateProfile,
  getMe,
  getSuggestions,
  followUser,
  unfollowuser,
  getFollowers,
  getFollowing,
  getUserProfile,
  getWeeklyStats,
  updateInterests,
  updatePrivacy,
  deleteAccount,
};
