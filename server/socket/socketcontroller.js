const messageModel = require("../models/message.model");

const activeUsers = {}; // { [blogId]: [{ userId, username, avatar, socketId }] }

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`⚡ User connected: ${socket.id}`);

    
    socket.on("join_room", async ({ blogId, user }) => {
      if (!blogId || !user?._id) return;
      
      socket.join(blogId);
    //   console.log(` User ${user.username} (${socket.id}) joined room: ${blogId}`);

      const previousMessages = await messageModel
        .find({ blogId })
        .sort({ createdAt: 1 })
        .limit(50);

      //  Manage active users for this blog room
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
      }

      //  Send initial data to the joining user ONLY
      socket.emit("load_messages", previousMessages); 

      //  Broadcast updated online users to EVERYONE in the room
      io.to(blogId).emit("update_active_users", activeUsers[blogId]);
    });

    //  Handle new message
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

        //  Format message to match frontend expectations
        const formattedMessage = {
          id: newMessage._id.toString(),
          author: newMessage.user.username,
          role: newMessage.user.role || 'Member',
          avatar: newMessage.user.avatar,
          text: newMessage.content,
          time: newMessage.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          likes: 0,
          blogId
        };

        //  Broadcast to entire room (including sender for consistency)
        io.to(blogId).emit("receive_message", formattedMessage);
      } catch (err) {
        console.error(" Error saving message:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    
    socket.on("disconnect", () => {
      console.log(` User disconnected: ${socket.id}`);

      // Remove user from all rooms they were in
      for (const blogId in activeUsers) {
        const beforeLength = activeUsers[blogId].length;
        activeUsers[blogId] = activeUsers[blogId].filter(u => u.socketId !== socket.id);
        
        // Only broadcast if the list actually changed
        if (activeUsers[blogId].length !== beforeLength) {
          io.to(blogId).emit("update_active_users", activeUsers[blogId]);
          console.log(` Updated users in ${blogId}: ${activeUsers[blogId].length} online`);
        }
      }
    });

    // Optional: Handle errors
    socket.on("error", (err) => {
      console.error(` Socket error for ${socket.id}:`, err);
    });
  });
};