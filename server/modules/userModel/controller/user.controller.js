const User = require("../../authModule/models/auth.entity");
const cloudinary = require("cloudinary").v2;

exports.updateProfile = async(req,res)=>{
    try {
        const userId = req.params.id;
          const user = await User.findById(userId);
        // allowed field for update
        const updateData = {};
        
        if(req.body.name) updateData.name = req.body.name;
        if(req.body.address) updateData.address = req.body.address;
        if(req.body.bio) updateData.bio = req.body.bio;

       //profile image
       if(req.file){
        if(user.profileImage?.public_id){
            await cloudinary.uploader.destroy(
                user.profileImage.public_id
            )
        }

        //save new image


        updateData.profileImage = {
        url:req.file.path,
        public_id: req.file.filename    
        }
       }

       const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { returnDocument: 'after' }
);

if (!updatedUser) {
    return res.status(404).json({
        success: false,
        message: "User not found"
    });
}
       res.status(200).json({
       sucess:true,
       message:"profile update",
       user:updatedUser
       })
                
    } catch (error) {
            res.status(500).json({
            success: false,
            message: error.message
        });
    }
}