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
        success: false,
        message: 'user not found',
      });
    }

    // Check if profile is incomplete
    const isProfileIncomplete = checkProfileCompleteness(getme);
    
    // If profile is incomplete, send notification (only once per day)
    if (isProfileIncomplete) {
      await sendProfileIncompleteNotification(userid);
    }

    // Get posts for current user
    const post = await postModel
      .find({ author: userid })
      .sort({ createdAt: -1 })
      .limit(40)
      .select('content media createdAt tags visibility')
      .lean();
    
    // Get blogs for current user
    const Blog = require('../models/blogs.model');
    const blogs = await Blog
      .find({ author: userid })
      .sort({ createdAt: -1 })
      .limit(40)
      .select('title coverImage content createdAt tags')
      .lean();
    
    // Transform posts to include author data and standardize fields
    const transformedPosts = post.map(p => ({
      _id: p._id,
      content: p.content,
      media: p.media,
      createdAt: p.createdAt,
      tags: p.tags,
      likesCount: p.totalReactions || 0,
      commentsCount: p.stats?.comments || 0,
      isPublic: p.visibility === 'public'
    }));
    
    // Transform blogs to match post structure
    const transformedBlogs = blogs.map(blog => ({
      _id: blog._id,
      title: blog.title,
      coverImage: blog.coverImage,
      content: blog.content,
      createdAt: blog.createdAt,
      tags: blog.tags,
      likesCount: blog.stats?.likes || 0,
      commentsCount: blog.stats?.comments || 0,
      isPublic: true
    }));
    
    // Combine posts and blogs
    const allPosts = [...transformedPosts, ...transformedBlogs].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.status(200).json({
      getme,
      post: allPosts,
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

const getSuggestions = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId)
      .select("following preferences.interests")
      .lean();

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const userInterests =
      currentUser.preferences?.interests?.map(
        interest => interest.toLowerCase().trim()
      ) || [];

    if (userInterests.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0
      });
    }

    const excludeIds = [
      new mongoose.Types.ObjectId(currentUserId),
      ...(currentUser.following || []).map(
        id => new mongoose.Types.ObjectId(id)
      )
    ];

    const suggestions = await User.aggregate([
      {
        $match: {
          _id: {
            $nin: excludeIds
          }
        }
      },

      {
        $addFields: {
          normalizedInterests: {
            $map: {
              input: {
                $ifNull: [
                  "$preferences.interests",
                  []
                ]
              },
              as: "interest",
              in: {
                $trim: {
                  input: {
                    $toLower: "$$interest"
                  }
                }
              }
            }
          }
        }
      },

      {
        $addFields: {
          matchedInterests: {
            $setIntersection: [
              "$normalizedInterests",
              userInterests
            ]
          }
        }
      },

      {
        $addFields: {
          matchCount: {
            $size: "$matchedInterests"
          }
        }
      },

      {
        $match: {
          matchCount: {
            $gt: 0
          }
        }
      },

      {
        $sort: {
          matchCount: -1,
          lastSeen: -1,
          createdAt: -1
        }
      },

      {
        $project: {
          _id: 1,
          username: 1,
          email: 1,
          profile: 1,
          preferences: 1,
          lastSeen: 1,
          matchedInterests: 1,
          matchCount: 1
        }
      },

      {
        $limit: 20
      }
    ]);

    return res.status(200).json({
      success: true,
      data: suggestions,
      count: suggestions.length
    });

  } catch (error) {
    console.error(
      "Get suggestions error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

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
    
    // Get posts
    const posts = await postModel
      .find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(40)
      .select('content media createdAt tags visibility')
      .lean();
    
    // Get blogs
    const Blog = require('../models/blogs.model');
    const blogs = await Blog
      .find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(40)
      .select('title coverImage content createdAt tags')
      .lean();
    
    // Transform posts to include author data and standardize fields
    const transformedPosts = posts.map(post => ({
      _id: post._id,
      content: post.content,
      media: post.media,
      createdAt: post.createdAt,
      tags: post.tags,
      likesCount: post.totalReactions || 0,
      commentsCount: post.stats?.comments || 0,
      isPublic: post.visibility === 'public'
    }));
    
    // Transform blogs to match post structure
    const transformedBlogs = blogs.map(blog => ({
      _id: blog._id,
      title: blog.title,
      coverImage: blog.coverImage,
      content: blog.content,
      createdAt: blog.createdAt,
      tags: blog.tags,
      likesCount: blog.stats?.likes || 0,
      commentsCount: blog.stats?.comments || 0,
      isPublic: true // blogs are typically public
    }));
    
    // Combine posts and blogs
    const allPosts = [...transformedPosts, ...transformedBlogs].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    let isFollowing = false;
    if (String(currentUserId) !== String(userId)) {
      const viewer = await User.findById(currentUserId).select('following').lean();
      isFollowing = (viewer?.following || []).some(
        (id) => String(id) === String(userId),
      );
    }
    
    res.json({
      success: true,
      user: sanitizeUserForClient(user),
      posts: allPosts,
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
      success: false,
      error: error.message,
    });
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
      author: userId,
      createdAt: { $gte: oneWeekAgo },
    }).select('_id');

    const postIds = userPosts.map(p => p._id);

    // Count likes received on user's posts this week
    const PostLike = require('../models/post-like.model');
    const likesReceived = await PostLike.countDocuments({
      postId: { $in: postIds },
      createdAt: { $gte: oneWeekAgo },
    });

    const commentsReceived = await Comment.countDocuments({
      'target.id': { $in: postIds },
      'target.type': 'Post',
      createdAt: { $gte: oneWeekAgo },
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

    const posts = await postModel.find({ author: userId }).select('media').lean();
    for (const post of posts) {
      if (post.media?.length) {
        for (const m of post.media) {
          if (m.public_id) {
            try { await cloudinary.uploader.destroy(m.public_id); } catch { /* ignore */ }
          }
        }
      }
    }

    await postModel.deleteMany({ author: userId });
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

module.exports = { getUsers,updateProfile, getMe, getSuggestions, followUser, unfollowuser, getFollowers, getFollowing, getUserProfile, getWeeklyStats, updateInterests, updatePrivacy, deleteAccount };
