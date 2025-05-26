const express = require("express");
const messageRouter = express.Router();
const messageController = require("../Controllers/messageController");
const auth = require("../Middleware/authMiddleware")
messageRouter.post(
  "/",
  auth,
  messageController.sendMessage
);
messageRouter.get(
  "/:chatId",
  auth,
  messageController.allMessages
);

module.exports = messageRouter;