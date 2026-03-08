const User = require('../models/user.model');
const { cloudinary } = require('../config/cloudinary.config');

const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    const updateData = {};

    if (req.body.name) updateData.name = req.body.name;
    if (req.body.address) updateData.address = req.body.address;
    if (req.body.bio) updateData.bio = req.body.bio;

    if (req.file) {
      if (user.profileImage?.public_id) {
        await cloudinary.uploader.destroy(user.profileImage.public_id);
      }

      updateData.profileImage = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { returnDocument: 'after' },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

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
    const getme = await User.findById(userid)
    if(!getme){
      return res.status(400).json({
        sucess:false,
        message:"user not found"
      })
    }

    res.status(200).json({
      getme
    })
  } catch (error) {
    return res.status(500).json({
      success:false,
      error:error.message
    })
  }
}

async function getSuggestions (req,res){
try {
  const user = await User.findById(req.user.id).select('following')
  const suggestions = await User.find({
    _id: {$nin: [...user.following,req.user.id]}
  }).select('name email')
  .limit(10)
  res.json(suggestions)
  
  
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

   await User.findByIdAndUpdate(ownerId,{
    $addToSet: {following: userId}
   })

   await User.findByIdAndUpdate(userId,{$addToSet:{
    followers : ownerId
   }})

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

    await User.findByIdAndUpdate(ownerId,{
      $pull:{following: userId}
    })

    await User.findByIdAndUpdate(userId,{
      $pull:{
        followers: ownerId
      }
    })

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