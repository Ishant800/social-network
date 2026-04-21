const messageModel = require("../models/message.model");
const PrivateMessage = require("../models/pmschema");
const User = require("../models/user.model");

// Separate runtime memory for private chat users
const activeUsers = {}; // For blog discussions
const privateActiveUsers = {}; // For private chat { userId: socketId }

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`⚡ User connected: ${socket.id}`);

    // ============ EXISTING BLOG DISCUSSION FEATURES ============
    socket.on("join_room", async ({ blogId, user }) => {
      if (!blogId || !user?._id) return;
      
      socket.join(blogId);

      const previousMessages = await messageModel
        .find({ blogId })
        .sort({ createdAt: 1 })
        .limit(50);

      if (!activeUsers[blogId]) activeUsers[blogId] = [];
      
      const existingUser = activeUsers[blogId].find(u => u.userId === user._id);
      if (!existingUser) {
        activeUsers[blogId].push({
          userId: user._id,
          username: user.username,
          avatar: user.avatar,
          socketId: socket.id,
          role: user.role || 'Member'
        });
      } else {
        existingUser.socketId = socket.id;
      }

      socket.emit("load_messages", previousMessages);
      io.to(blogId).emit("update_active_users", activeUsers[blogId]);
    });

    socket.on("send_message", async (data) => {
      const { blogId, message, user } = data;
      if (!blogId || !message?.trim()) return;

      try {
        const newMessage = await messageModel.create({
          blogId,
          content: message.trim(),
          user: {
            _id: user._id,
            username: user.username,
            avatar: user.avatar,
            role: user.role || 'Member'
          },
          createdAt: new Date()
        });

        const formattedMessage = {
          id: newMessage._id.toString(),
          author: newMessage.user.username,
          role: newMessage.user.role || 'Member',
          avatar: newMessage.user.avatar,
          text: newMessage.content,
          time: newMessage.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          userId: newMessage.user._id,
          blogId
        };

        io.to(blogId).emit("receive_message", formattedMessage);
      } catch (err) {
        console.error("Error saving message:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ============ PRIVATE CHAT FEATURES ============
    
    // Register user for private chat
    socket.on("register_private_user", ({ userId }) => {
      if (!userId) return;
      privateActiveUsers[userId] = socket.id;
      console.log(`User ${userId} registered for private chat`);
    });

    // Send private message
    socket.on("send_private_message", async ({ from, to, message }) => {
      if (!from || !to || !message?.trim()) return;

      try {
        // Save message to database
        const newMessage = await PrivateMessage.create({
          conversationId: [from, to].sort().join('_'),
          from,
          to,
          content: message.trim()
        });

        // Update both users' chatList
        await User.findByIdAndUpdate(from, { $addToSet: { chatList: to } });
        await User.findByIdAndUpdate(to, { $addToSet: { chatList: from } });

        const populatedMessage = await newMessage.populate('from to', 'username profile.avatar');

        const formattedMessage = {
          id: populatedMessage._id,
          from: {
            _id: populatedMessage.from._id,
            username: populatedMessage.from.username,
            avatar: populatedMessage.from.profile?.avatar?.url
          },
          to: {
            _id: populatedMessage.to._id,
            username: populatedMessage.to.username,
            avatar: populatedMessage.to.profile?.avatar?.url
          },
          content: populatedMessage.content,
          createdAt: populatedMessage.createdAt,
          read: false,
          delivered: false
        };

        // Send to sender
        socket.emit("private_message_sent", formattedMessage);

        // Send to receiver if online
        const receiverSocketId = privateActiveUsers[to];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_private_message", formattedMessage);
          
          // Mark as delivered
          await PrivateMessage.findByIdAndUpdate(newMessage._id, { delivered: true });
          socket.emit("message_delivered", { messageId: newMessage._id });
        }
      } catch (err) {
        console.error("Error sending private message:", err);
        socket.emit("error", { message: "Failed to send private message" });
      }
    });

    // Mark messages as read
    socket.on("mark_private_messages_read", async ({ userId, otherUserId }) => {
      try {
        const conversationId = [userId, otherUserId].sort().join('_');
        
        await PrivateMessage.updateMany(
          { conversationId, to: userId, read: false },
          { read: true }
        );

        // Notify other user that messages were read
        const otherSocketId = privateActiveUsers[otherUserId];
        if (otherSocketId) {
          io.to(otherSocketId).emit("messages_read", { 
            conversationId, 
            readBy: userId 
          });
        }
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    });

    // Get chat history
    socket.on("get_private_chat_history", async ({ userId, otherUserId }) => {
      try {
        const conversationId = [userId, otherUserId].sort().join('_');
        
        const messages = await PrivateMessage.find({ conversationId })
          .sort({ createdAt: 1 })
          .limit(50)
          .populate('from to', 'username profile.avatar');

        socket.emit("private_chat_history", messages);
      } catch (err) {
        console.error("Error getting chat history:", err);
        socket.emit("error", { message: "Failed to load chat history" });
      }
    });

    // Get user's chat list
    socket.on("get_chat_list", async ({ userId }) => {
      try {
        const user = await User.findById(userId)
          .populate('chatList', 'username profile.avatar lastSeen');

        if (!user) return;

        // Get last message for each chat
        const chatListWithLastMsg = await Promise.all(
          user.chatList.map(async (chatUser) => {
            const conversationId = [userId, chatUser._id].sort().join('_');
            const lastMessage = await PrivateMessage.findOne({ conversationId })
              .sort({ createdAt: -1 });
            
            const unreadCount = await PrivateMessage.countDocuments({
              conversationId,
              to: userId,
              read: false
            });

            return {
              user: chatUser,
              lastMessage,
              unreadCount
            };
          })
        );

        socket.emit("chat_list_data", chatListWithLastMsg);
      } catch (err) {
        console.error("Error getting chat list:", err);
        socket.emit("error", { message: "Failed to load chat list" });
      }
    });

    // Typing indicator for private chat
    socket.on("private_typing", ({ from, to, isTyping }) => {
      if (!from || !to) return;
      const receiverSocketId = privateActiveUsers[to];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user_typing", { userId: from, isTyping });
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      // Remove from blog discussions
      for (const blogId in activeUsers) {
        const beforeLength = activeUsers[blogId].length;
        activeUsers[blogId] = activeUsers[blogId].filter(u => u.socketId !== socket.id);
        
        if (activeUsers[blogId].length !== beforeLength) {
          io.to(blogId).emit("update_active_users", activeUsers[blogId]);
        }
      }

      // Remove from private chat users
      for (const userId in privateActiveUsers) {
        if (privateActiveUsers[userId] === socket.id) {
          delete privateActiveUsers[userId];
          break;
        }
      }

      console.log(`User disconnected: ${socket.id}`);
    });
  });
};