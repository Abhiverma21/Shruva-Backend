let ioInstance;
const onlineUsers = new Map(); // userId -> socketId
const chatRooms = new Map(); // chatId -> Set of socketIds

module.exports = (io) => {
  ioInstance = io;
  module.exports.io = ioInstance;
  
  io.on("connection", (socket) => {
    console.log(`[Socket] New connection: ${socket.id}`);

    // User joins their personal room
    socket.on("addUser", (userId) => {
      try {
        socket.userId = userId; // Store userId on socket for later reference
        socket.join(userId.toString());
        onlineUsers.set(userId.toString(), socket.id);
        console.log(`[Socket] User ${userId} joined room`);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      } catch (e) {
        console.warn("addUser error", e.message || e);
      }
    });

    // User joins a chat room
    socket.on("joinChat", (chatId) => {
      try {
        socket.join(`chat-${chatId}`);
        if (!chatRooms.has(chatId)) {
          chatRooms.set(chatId, new Set());
        }
        chatRooms.get(chatId).add(socket.id);
        console.log(`[Socket] User joined chat room: chat-${chatId}`);
      } catch (e) {
        console.warn("joinChat error", e.message || e);
      }
    });

    // User leaves a chat room
    socket.on("leaveChat", (chatId) => {
      try {
        socket.leave(`chat-${chatId}`);
        if (chatRooms.has(chatId)) {
          chatRooms.get(chatId).delete(socket.id);
        }
        console.log(`[Socket] User left chat room: chat-${chatId}`);
      } catch (e) {
        console.warn("leaveChat error", e.message || e);
      }
    });

    socket.on("typing", ({ senderId, receiverId }) => {
      if (receiverId) io.to(receiverId.toString()).emit("typing", { senderId });
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
      if (receiverId) io.to(receiverId.toString()).emit("stopTyping", { senderId });
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
      
      // Remove from onlineUsers
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      
      // Remove from chat rooms
      for (let [chatId, sockets] of chatRooms.entries()) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          chatRooms.delete(chatId);
        }
      }
      
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
  });
};

module.exports.io = ioInstance;
