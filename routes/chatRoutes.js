const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const protect = require("../middleware/Authmiddleware");

// Send a message
router.post("/send", protect, chatController.sendMessage);

// Get chat history between two users
router.get("/history/:otherUserId", protect, chatController.getChatHistory);

// Get all conversations for a user
router.get("/conversations", protect, chatController.getAllConversations);

// Delete a message
router.delete("/:messageId", protect, chatController.deleteMessage);

module.exports = router;
