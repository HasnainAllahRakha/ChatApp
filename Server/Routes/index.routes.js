const express = require("express");
const router = express.Router();

const userRouter = require("./userRoutes");
const chatRouter = require("./chatRoutes");
const messageRouter = require("./messageRoutes");


router.use("/api/user", userRouter);
router.use("/api/chat", chatRouter);
router.use("/api/message",messageRouter)
module.exports = router;
