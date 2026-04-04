// models/message.model.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  blogId: { type: String, required: true, index: true },
  content: { type: String, required: true, trim: true },
  user: {
    _id: { type: String, required: true },
    username: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, default: 'Member' }
  },
  createdAt: { type: Date, default: Date.now, index: true }
});   
  
 
module.exports = mongoose.model('Message', messageSchema); 