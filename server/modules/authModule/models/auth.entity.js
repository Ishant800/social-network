const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    email: { type: String, 
        required: true,
         unique: true,
          index: true },

    name: { type: String, 
        default: '' ,
        required:true,index: true},

    password:{type:String,required: true},
    bio:{type:String,
        default:""

    },
    address:{type:String},
    profileImage:{
        url:{
            type:String,
            default:null
        },
        public_id:{
            type:String,
            default:null
        }
    },
    followers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],

    following:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
     friends:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    friendsRequestReceived:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    friendsRequestSent:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    isActive:{
        type:Boolean,
        default:true
    }

     },{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
     }
)

module.exports = mongoose.model("User",userSchema)