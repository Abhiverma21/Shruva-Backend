const onlineUsers = new Map(); // userId -> socketId

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // =====================
    // USER ONLINE
    // =====================
    socket.on("addUser", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} is online`);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    // =====================
    // SEND MESSAGE
    // =====================
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
      const receiverSocketId = onlineUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", {
          senderId,
          text,
          createdAt: new Date()
        });
        console.log(`Message from ${senderId} to ${receiverId}`);
      } else {
        console.log(`User ${receiverId} is offline`);
      }
    });

    // =====================
    // TYPING
    // =====================
    socket.on("typing", ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", senderId);
      }
    });

    socket.on("stopTyping", ({ receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping");
      }
    });

    // =====================
    // SEEN MESSAGE
    // =====================
    socket.on("messageSeen", ({ senderId }) => {
      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageSeen");
      }
    });

    // =====================
    // DISCONNECT
    // =====================
    socket.on("disconnect", () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} is offline`);
          break;
        }
      }

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      console.log("Socket disconnected:", socket.id);
    });
  });
};
