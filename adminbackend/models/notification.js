const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  message: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;



