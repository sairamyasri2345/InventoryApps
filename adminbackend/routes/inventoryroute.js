const express = require("express");
const jwt = require("jsonwebtoken");
const { registerUser, loginUser,changePassword } = require("../controllers/inventoryadmin");
const User = require('../models/inventoryadmin');

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
    const decoded = jwt.verify(token, "@453$^4532#@$!%^!T~Yvfwgd@$^%TyvgdY48IHYEQYTREDJYKFVDK"); 
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

module.exports = router;

