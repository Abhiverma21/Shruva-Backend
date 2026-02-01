const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const protect = require("../middleware/Authmiddleware");

// GET /api/chats - list chats for logged-in user
router.get("/", protect, chatController.getChats);

// PUT /api/chats/:chatId/pin - pin a chat
router.put("/:chatId/pin", protect, chatController.pinChat);

// PUT /api/chats/:chatId/unpin - unpin a chat
router.put("/:chatId/unpin", protect, chatController.unpinChat);

// PUT /api/chats/:chatId/mute - mute notifications
router.put("/:chatId/mute", protect, chatController.muteChat);

// PUT /api/chats/:chatId/unmute - unmute notifications
router.put("/:chatId/unmute", protect, chatController.unmuteChat);

// PUT /api/chats/:chatId/archive - archive a chat
router.put("/:chatId/archive", protect, chatController.archiveChat);

// DELETE /api/chats/:chatId - delete a chat
router.delete("/:chatId", protect, chatController.deleteChat);

module.exports = router;
