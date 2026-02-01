const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const protect = require("../middleware/Authmiddleware");

// GET /api/messages/:chatId
router.get("/:chatId", protect, messageController.getMessagesByChat);

// POST /api/messages/mark-seen/:messageId
router.post("/mark-seen/:messageId", protect, messageController.markMessageSeen);

// POST /api/messages
router.post("/", protect, messageController.sendMessage);

module.exports = router;
