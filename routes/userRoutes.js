const express = require("express");
const router = express.Router();
const protect = require("../middleware/Authmiddleware");
const {
  searchUsers,
  addFriend,
  getFriends,
} = require("../controllers/userController");

router.get("/search", protect, searchUsers);
router.post("/add-friend", protect, addFriend);
router.get("/friends", protect, getFriends);

module.exports = router;
