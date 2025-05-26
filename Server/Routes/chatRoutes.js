
const express = require("express");
const chatRouter = express.Router();
const chatController = require("../Controllers/chatController");
const auth = require("../Middleware/authMiddleware")

chatRouter.post(
  "/",
  auth,
  chatController.accessChat
);
chatRouter.get(
  "/fetch",
  auth,
  chatController.fetchChat
);
chatRouter.post(
  "/group",
  auth,
  chatController.createGroup
);
chatRouter.put(
  "/group/rename",
  auth,
  chatController.renameGroup
);
chatRouter.put(
  "/group/remove",
  auth,
  chatController.removeGroup
);
chatRouter.put(
  "/group/add",
  auth,
  chatController.addtoGroup
);

module.exports = chatRouter;
