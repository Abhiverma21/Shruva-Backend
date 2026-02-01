const Chat = require("../models/Chat");
const Message = require("../models/Message");

// PUT /api/chats/:chatId/pin
exports.pinChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findByIdAndUpdate(chatId, { isPinned: true }, { new: true });
    res.status(200).json({ success: true, message: "Chat pinned", chat });
  } catch (err) {
    console.error("pinChat error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/chats/:chatId/unpin
exports.unpinChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findByIdAndUpdate(chatId, { isPinned: false }, { new: true });
    res.status(200).json({ success: true, message: "Chat unpinned", chat });
  } catch (err) {
    console.error("unpinChat error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/chats/:chatId/mute
exports.muteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findByIdAndUpdate(chatId, { isMuted: true }, { new: true });
    res.status(200).json({ success: true, message: "Chat muted", chat });
  } catch (err) {
    console.error("muteChat error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/chats/:chatId/unmute
exports.unmuteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findByIdAndUpdate(chatId, { isMuted: false }, { new: true });
    res.status(200).json({ success: true, message: "Chat unmuted", chat });
  } catch (err) {
    console.error("unmuteChat error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/chats/:chatId/archive
exports.archiveChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findByIdAndUpdate(chatId, { isArchived: true }, { new: true });
    res.status(200).json({ success: true, message: "Chat archived", chat });
  } catch (err) {
    console.error("archiveChat error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/chats/:chatId
exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    await Chat.findByIdAndDelete(chatId);
    res.status(200).json({ success: true, message: "Chat deleted" });
  } catch (err) {
    console.error("deleteChat error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/chats - get all chats for logged-in user
exports.getChats = async (req, res) => {
  try {
    const userId = req.userId;

    const chats = await Chat.find({ members: userId })
      .populate("members", "username fullName")
      .populate({
        path: "lastMessage",
        populate: { path: "senderId", select: "username fullName" },
      })
      .sort({ updatedAt: -1 });

    // Format response: extract friend info and last message details
    const formattedChats = chats.map((chat) => {
      const friend = chat.members.find(m => m._id.toString() !== userId);
      return {
        _id: chat._id,
        chatId: chat._id,
        friend: friend ? { _id: friend._id, username: friend.username, fullName: friend.fullName } : null,
        lastMessage: chat.lastMessage ? {
          _id: chat.lastMessage._id,
          text: chat.lastMessage.text,
          senderId: chat.lastMessage.senderId,
          createdAt: chat.lastMessage.createdAt,
        } : null,
        updatedAt: chat.updatedAt,
      };
    });

    res.status(200).json({ success: true, chats: formattedChats });
  } catch (err) {
    console.error("getChats error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




