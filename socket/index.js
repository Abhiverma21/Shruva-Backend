let ioInstance;
const onlineUsers = new Map(); // userId -> socketId

module.exports = (io) => {
  ioInstance = io;
  // update exported reference so other modules can access the instance
  module.exports.io = ioInstance;
  io.on("connection", (socket) => {
    // Client should call `addUser` with their userId to join their room
    socket.on("addUser", (userId) => {
      try {
        socket.join(userId.toString());
        onlineUsers.set(userId.toString(), socket.id);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      } catch (e) {
        console.warn("addUser error", e.message || e);
      }
    });

    socket.on("typing", ({ senderId, receiverId }) => {
      if (receiverId) io.to(receiverId.toString()).emit("typing", { senderId });
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
      if (receiverId) io.to(receiverId.toString()).emit("stopTyping", { senderId });
    });

    socket.on("disconnect", () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
  });
};


// allow other modules to access io instance
module.exports.io = ioInstance;
