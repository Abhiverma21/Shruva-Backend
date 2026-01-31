const Message = require("../models/Message");

// Get all messages for a conversation
    exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const messages = await Message.find({ conversationId })
        .populate("sender", "name email")
        .sort({ timestamp: 1 });

        res.status(200).json({ success: true, messages });
    } catch (err) {
        res.status(500).json({ message: "Error fetching messages", error: err.message });
    }
    };

// Create a new message
exports.createMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.userId;

    if (!conversationId || !content) {
      return res.status(400).json({ message: "Conversation ID and content required" });
    }

    const message = new Message({
      conversationId,
      sender: senderId,
      content,
      timestamp: new Date(),
    });

    await message.save();
    await message.populate("sender", "name email");

    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ message: "Error creating message", error: err.message });
  }
};

// Update a message
exports.updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }

    message.content = content;
    message.edited = true;
    message.editedAt = new Date();

    await message.save();
    res.status(200).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ message: "Error updating message", error: err.message });
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

// Search messages
exports.searchMessages = async (req, res) => {
  try {
    const { conversationId, query } = req.query;

    if (!conversationId || !query) {
      return res.status(400).json({ message: "Conversation ID and search query required" });
    }

    const messages = await Message.find({
      conversationId,
      content: { $regex: query, $options: "i" },
    })
      .populate("sender", "name email")
      .sort({ timestamp: -1 });

    res.status(200).json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ message: "Error searching messages", error: err.message });
  }
};
