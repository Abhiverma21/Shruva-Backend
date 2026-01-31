const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const protect = require("../middleware/Authmiddleware");

// Get all messages in a conversation
router.get("/:conversationId", protect, messageController.getMessages);

// Create a new message
router.post("/", protect, messageController.createMessage);

// Update a message
router.put("/:messageId", protect, messageController.updateMessage);

// Delete a message
router.delete("/:messageId", protect, messageController.deleteMessage);

// Search messages in a conversation
router.get("/search/query", protect, messageController.searchMessages);

module.exports = router;
