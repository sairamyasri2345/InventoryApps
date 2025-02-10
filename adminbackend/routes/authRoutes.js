const express = require("express");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const Notification = require("../models/notification");
const { registerUser, loginUser,changePassword } = require("../controllers/authController");
const User = require('../models/userschema');

const { authenticateToken } = require('../controllers/authenticateToken')

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expecting token in 'Bearer token'
  if (!token) {
    return res.status(401).json({ message: "Authorization denied, no token" });
  }

  try {
    const decoded = jwt.verify(token, "asdrtfgyhjudwkmeqnjdebai#$%&#^#$W!%^#$*&284erhjbfugr"); 
    req.user = { id: decoded.id }; 
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

router.put("/change-password", authMiddleware, changePassword);
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ data: user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data", error });
  }
});
router.get('/notificationCount', async (req, res) => {
  try {
    const count = await Notification.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notification count' });
  }
});

module.exports = router;

