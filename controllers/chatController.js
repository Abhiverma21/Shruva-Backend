const Message = require("../models/Message");
const User = require("../models/User");

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.userId;

    if (!receiverId || !content) {
      return res.status(400).json({ message: "Receiver ID and content required" });
    }

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      timestamp: new Date(),
    });

    await message.save();
    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ message: "Error sending message", error: err.message });
  }
};

// Get chat history between two users
exports.getChatHistory = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.userId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ message: "Error fetching chat history", error: err.message });
  }
};

// Get all conversations for a user
exports.getAllConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", userId] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$content" },
          lastMessageTime: { $first: "$timestamp" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
    ]);

    res.status(200).json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ message: "Error fetching conversations", error: err.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    await Message.findByIdAndDelete(messageId);
    res.status(200).json({ success: true, message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting message", error: err.message });
  }
};




