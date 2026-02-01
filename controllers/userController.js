const User = require("../models/User");
const Chat = require("../models/Chat");

// GET /api/users/search?username=
exports.searchUsers = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || username.trim() === "") {
      return res.status(200).json({ success: true, users: [] });
    }

    const regex = new RegExp(username.trim(), "i");

    const users = await User.find({
      username: { $regex: regex },
      _id: { $ne: req.userId },
    }).select("username fullName").limit(50);

    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("searchUsers error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/users/add-friend
exports.addFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.userId;

    if (!friendId) return res.status(400).json({ success: false, message: "friendId required" });
    if (userId === friendId) return res.status(400).json({ success: false, message: "Cannot add yourself" });

    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId),
    ]);

    if (!friend) return res.status(404).json({ success: false, message: "Friend not found" });

    if (user.friends && user.friends.some(f => f.toString() === friendId)) {
      // already friends - find existing chat
      const existingChat = await Chat.findOne({ members: { $all: [userId, friendId] } });
      return res.status(400).json({ success: false, message: "Already friends", chatId: existingChat?._id });
    }

    // Add to both users' friend lists
    await Promise.all([
      User.findByIdAndUpdate(userId, { $addToSet: { friends: friendId } }),
      User.findByIdAndUpdate(friendId, { $addToSet: { friends: userId } }),
    ]);

    // Ensure a single chat exists for the pair
    let chat = await Chat.findOne({ members: { $all: [userId, friendId] } });
    if (!chat) {
      chat = await Chat.create({ members: [userId, friendId] });
    }

    // Emit friendAdded event to BOTH users (sender and friend)
    try {
      const socketModule = require("../socket");
      const io = socketModule.io;
      if (io) {
        // Emit to the friend
        io.to(friendId.toString()).emit("friendAdded", { from: userId, chatId: chat._id });
        // Emit to the user who added the friend (sender)
        io.to(userId.toString()).emit("friendAdded", { from: friendId, chatId: chat._id });
      }
    } catch (e) {
      // non-fatal
      console.warn("Could not emit friendAdded", e.message || e);
    }

    res.status(200).json({ success: true, message: "Friend added", chatId: chat._id });
  } catch (err) {
    console.error("addFriend error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/users/friends
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("friends", "username fullName");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, friends: user.friends || [] });
  } catch (err) {
    console.error("getFriends error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
