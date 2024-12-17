
const jwt = require('jsonwebtoken');
require('dotenv').config();
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: "Access Denied, No Token Provided" });
  }

  jwt.verify(token, "asdrtfgyhjudwkmeqnjdebai#$%&#^#$W!%^#$*&284erhjbfugr", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
