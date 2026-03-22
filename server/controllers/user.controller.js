const User = require('../models/user.model');
const { cloudinary } = require('../config/cloudinary.config');

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (req.body.fullName) user.profile.fullName = req.body.fullName;
    if (req.body.bio) user.profile.bio = req.body.bio;
    if (req.body.location) user.profile.location = req.body.location;
    if (req.body.website) user.profile.website = req.body.website;

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
    const updatedUser = await User.findById(userId).select('-password');

    res.status(200).json({
      sucess: true,
      message: 'profile update',
      user: updatedUser,
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

    res.status(200).json({
      getme
    });
  } catch (error) {
    return res.status(500).json({
      success:false,
      error:error.message
    })
  }
}

async function getSuggestions (req,res){
try {
  const limit = Number(req.query.limit) || 10;
  const user = await User.findById(req.user.id).select('following');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const suggestions = await User.find({
    _id: {$nin: [...user.following,req.user.id]}
  }).select('-password')
  .limit(limit);

  res.status(200).json(suggestions);
  
  
} catch (error) {
   return res.status(500).json({
      success:false,
      error:error.message
    })
}
  
}


async function followUser(req,res){
  try {
    const ownerId = req.user.id;
   const {userId} = req.params;

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
