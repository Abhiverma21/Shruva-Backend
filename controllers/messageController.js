const Message = require("../models/Message");
const Chat = require("../models/Chat");

// GET /api/messages/:chatId
exports.getMessagesByChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;
    
    if (!chatId) return res.status(400).json({ success: false, message: "chatId required" });

    // Verify user is a member of this chat
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });
    
    const isMember = chat.members.some(memberId => memberId.toString() === userId.toString());
    if (!isMember) {
      return res.status(403).json({ success: false, message: "Unauthorized: You are not a member of this chat" });
    }

    const messages = await Message.find({ chatId })
      .populate("senderId", "username fullName")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error("getMessagesByChat error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/messages/mark-seen/:messageId
exports.markMessageSeen = async (req, res) => {
  try {
    const { messageId } = req.params;
    if (!messageId) return res.status(400).json({ success: false, message: "messageId required" });

    const message = await Message.findByIdAndUpdate(
      messageId,
      { isSeen: true },
      { new: true }
    ).populate("senderId", "username fullName");

    res.status(200).json({ success: true, message });
  } catch (err) {
    console.error("markMessageSeen error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/messages
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const senderId = req.userId;

    if (!chatId || !text) return res.status(400).json({ success: false, message: "chatId and text required" });

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

    // Verify sender is a member of this chat
    const isMember = chat.members.some(m => m.toString() === senderId.toString());
    if (!isMember) {
      return res.status(403).json({ success: false, message: "You are not a member of this chat" });
    }

    const message = await Message.create({ chatId, senderId, text });

    // update chat lastMessage
    chat.lastMessage = message._id;
    await chat.save();

    // populate message for response
    const populatedMessage = await Message.findById(message._id).populate("senderId", "username fullName");

    // Emit to OTHER users in the chat room (not sender - they already have optimistic message)
    try {
      const socketModule = require("../socket");
      const io = socketModule.io;
      if (io) {
        // Get all sockets in the chat room
        const socketsInRoom = await io.in(`chat-${chatId}`).fetchSockets();
        
        // Emit to all OTHER users EXCEPT the sender
        for (const socket of socketsInRoom) {
          if (socket.userId?.toString() !== senderId.toString()) {
            socket.emit("newMessage", { chatId, message: populatedMessage });
          }
        }
        console.log(`[Message] Emitted to chat-${chatId} (excluding sender)`);
      }
    } catch (e) {
      console.warn("Could not emit newMessage", e.message || e);
    }

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (err) {
    console.error("sendMessage error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
