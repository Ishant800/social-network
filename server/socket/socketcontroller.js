const messageModel = require("../models/message.model");
const PrivateMessage = require("../models/pmschema");
const User = require("../models/user.model");
const Blog = require("../models/blogs.model");

// Separate runtime memory for private chat users
const activeUsers = {}; // For blog discussions
const privateActiveUsers = {}; // For private chat { userId: Set<socketId> }

const isUserOnline = (userId) => {
  const sockets = privateActiveUsers[String(userId)];
  return Boolean(sockets && sockets.size > 0);
};

const addPrivateSocket = (userId, socketId) => {
  const key = String(userId);
  if (!privateActiveUsers[key]) privateActiveUsers[key] = new Set();
  const wasOffline = privateActiveUsers[key].size === 0;
  privateActiveUsers[key].add(socketId);
  return wasOffline;
};

const removePrivateSocket = (socketId) => {
  for (const userId of Object.keys(privateActiveUsers)) {
    if (privateActiveUsers[userId].has(socketId)) {
      privateActiveUsers[userId].delete(socketId);
      const isNowOffline = privateActiveUsers[userId].size === 0;
      if (isNowOffline) delete privateActiveUsers[userId];
      return { userId, isNowOffline };
    }
  }
  return null;
};

const emitToUser = (io, userId, event, data) => {
  const sockets = privateActiveUsers[String(userId)];
  if (!sockets) return;
  sockets.forEach((socketId) => io.to(socketId).emit(event, data));
};

const getFirstSocketId = (userId) => {
  const sockets = privateActiveUsers[String(userId)];
  if (!sockets || sockets.size === 0) return null;
  return [...sockets][0];
};

const USER_CHAT_FIELDS = 'username profile.fullName profile.avatar lastSeen';

const formatChatUser = (user) => {
  if (!user) return null;
  const profile = user.profile || {};
  const avatar = profile.avatar;
  return {
    _id: String(user._id),
    username: user.username,
    fullName: profile.fullName || user.username,
    profile: {
      fullName: profile.fullName || null,
      avatar: avatar?.url
        ? { url: avatar.url, public_id: avatar.public_id || null }
        : null,
    },
    profileImage: avatar?.url ? { url: avatar.url } : null,
    lastSeen: user.lastSeen || null,
  };
};

const formatPrivateMessageUser = (user) => {
  if (!user) return null;
  const profile = user.profile || {};
  const avatarUrl = profile.avatar?.url || null;
  return {
    _id: String(user._id),
    username: user.username,
    fullName: profile.fullName || user.username,
    avatar: avatarUrl,
    profile: {
      fullName: profile.fullName || null,
      avatar: profile.avatar || null,
    },
    profileImage: avatarUrl ? { url: avatarUrl } : null,
  };
};

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

      // Format messages with like data
      const formattedMessages = previousMessages.map(msg => ({
        _id: msg._id,
        content: msg.content,
        user: msg.user,
        createdAt: msg.createdAt,
        likedBy: msg.likedBy || [],
        likes: (msg.likedBy || []).length,
        replyTo: msg.replyTo || null
      }));

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
   
      // Update blog's discussion lastActivity and add participant
      await Blog.findByIdAndUpdate(
        blogId,
        {
          $set: { 'discussion.lastActivity': new Date() },
          $addToSet: { 'discussion.participants': user._id }
        }
      );

      socket.emit("load_messages", formattedMessages);
      io.to(blogId).emit("update_active_users", activeUsers[blogId]);
    });

    socket.on("send_message", async (data) => {
      const { blogId, message, user, replyTo } = data;
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
          replyTo: replyTo || null,
          createdAt: new Date()
        });

        // Update blog's discussion lastActivity and add participant
        await Blog.findByIdAndUpdate(
          blogId,
          {
            $set: { 'discussion.lastActivity': new Date() },
            $addToSet: { 'discussion.participants': user._id }
          }
        );

        const formattedMessage = {
          id: newMessage._id.toString(),
          author: newMessage.user.username,
          role: newMessage.user.role || 'Member',
          avatar: newMessage.user.avatar,
          text: newMessage.content,
          time: newMessage.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          userId: newMessage.user._id,
          replyTo: newMessage.replyTo,
          blogId
        };

        socket.to(blogId).emit("receive_message", formattedMessage);
        socket.emit("receive_message", formattedMessage);
      } catch (err) {
        console.error("Error saving message:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle message likes
    socket.on("like_message", async (data) => {
      const { blogId, messageId, userId, action } = data;
      if (!blogId || !messageId || !userId) return;

      try {
        // Update message likes in database
        const updateOperation = action === 'like'
          ? { $addToSet: { likedBy: userId } }
          : { $pull: { likedBy: userId } };

        await messageModel.findByIdAndUpdate(messageId, updateOperation);

        // Broadcast like update to all users in the room
        io.to(blogId).emit("message_liked", {
          messageId,
          userId,
          action
        });
      } catch (err) {
        console.error("Error updating message like:", err);
      }
    });

    // ============ PRIVATE CHAT FEATURES ============
    
    // Register user for private chat
    socket.on("register_private_user", async ({ userId }) => {
      if (!userId) return;
      const userKey = String(userId);
      const cameOnline = addPrivateSocket(userKey, socket.id);

      await User.findByIdAndUpdate(userId, { lastSeen: new Date() });

      const user = await User.findById(userId).select('chatList');
      if (user?.chatList?.length) {
        if (cameOnline) {
          user.chatList.forEach((chatUserId) => {
            emitToUser(io, chatUserId, "user_status_changed", {
              userId: userKey,
              isOnline: true,
            });
          });
        }

        const onlineUserIds = user.chatList
          .map((id) => String(id))
          .filter((id) => isUserOnline(id));

        socket.emit("online_users_snapshot", { onlineUserIds });
      } else {
        socket.emit("online_users_snapshot", { onlineUserIds: [] });
      }

      console.log(`User ${userKey} registered for private chat`);
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

        const populatedMessage = await newMessage.populate('from to', USER_CHAT_FIELDS);

        const messageId = String(populatedMessage._id);
        const formattedMessage = {
          id: messageId,
          _id: messageId,
          from: formatPrivateMessageUser(populatedMessage.from),
          to: formatPrivateMessageUser(populatedMessage.to),
          content: populatedMessage.content,
          createdAt: populatedMessage.createdAt,
          read: false,
          delivered: false
        };

        // Confirm to sender only
        socket.emit("private_message_sent", formattedMessage);

        // Send to receiver if online (never echo back to sender socket)
        const receiverSocketId = getFirstSocketId(to);
        const senderSocketId = socket.id;
        if (receiverSocketId && receiverSocketId !== senderSocketId) {
          io.to(receiverSocketId).emit("receive_private_message", formattedMessage);

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
        emitToUser(io, otherUserId, "messages_read", {
          conversationId,
          readBy: String(userId),
        });
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
          .populate('from to', USER_CHAT_FIELDS);

        const formattedHistory = messages.map((msg) => ({
          id: String(msg._id),
          _id: String(msg._id),
          from: formatPrivateMessageUser(msg.from),
          to: formatPrivateMessageUser(msg.to),
          content: msg.content,
          createdAt: msg.createdAt,
          read: msg.read,
          delivered: msg.delivered,
        }));

        socket.emit("private_chat_history", {
          otherUserId: String(otherUserId),
          messages: formattedHistory,
        });
      } catch (err) {
        console.error("Error getting chat history:", err);
        socket.emit("error", { message: "Failed to load chat history" });
      }
    });

    // Get user's chat list
    socket.on("get_chat_list", async ({ userId }) => {
      try {
        const user = await User.findById(userId)
          .populate('chatList', USER_CHAT_FIELDS);

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

            // Check if user is online (connected in last 30 seconds)
            const isOnline = isUserOnline(chatUser._id);

            return {
              user: formatChatUser(chatUser),
              lastMessage,
              unreadCount,
              isOnline,
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
      emitToUser(io, to, "user_typing", { userId: String(from), isTyping });
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      // Remove from blog discussions
      for (const blogId in activeUsers) {
        const beforeLength = activeUsers[blogId].length;
        activeUsers[blogId] = activeUsers[blogId].filter(u => u.socketId !== socket.id);
        
        if (activeUsers[blogId].length !== beforeLength) {
          io.to(blogId).emit("update_active_users", activeUsers[blogId]);
        }
      }

      const removed = removePrivateSocket(socket.id);
      if (removed?.isNowOffline) {
        const userKey = String(removed.userId);
        await User.findByIdAndUpdate(userKey, { lastSeen: new Date() });

        const user = await User.findById(userKey).select('chatList');
        if (user?.chatList?.length) {
          user.chatList.forEach((chatUserId) => {
            emitToUser(io, chatUserId, "user_status_changed", {
              userId: userKey,
              isOnline: false,
            });
          });
        }
      }

      console.log(`User disconnected: ${socket.id}`);
    });
  });
};