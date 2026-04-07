const messageModel = require("../models/message.model");

const activeUsers = {};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`⚡ User connected: ${socket.id}`);

    socket.on("join_room", async ({ blogId, user }) => {
      if (!blogId || !user?._id) return;
      
      socket.join(blogId);

      // Get previous messages
      const previousMessages = await messageModel
        .find({ blogId })
        .sort({ createdAt: 1 })
        .limit(50);

      // Manage active users
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

      // Send messages to user
      socket.emit("load_messages", previousMessages);
      
      // Broadcast updated users to room
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

    socket.on("disconnect", () => {
      for (const blogId in activeUsers) {
        const beforeLength = activeUsers[blogId].length;
        activeUsers[blogId] = activeUsers[blogId].filter(u => u.socketId !== socket.id);
        
        if (activeUsers[blogId].length !== beforeLength) {
          io.to(blogId).emit("update_active_users", activeUsers[blogId]);
        }
      }
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};