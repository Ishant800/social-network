const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: '' ,required:true,index: true},
    password:{type:String,required: true},
    bio:{type:String},
    address:{type:String},
    profileImage:{type:String}

     },{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
     }
)

module.exports = mongoose.model("User",userSchema)