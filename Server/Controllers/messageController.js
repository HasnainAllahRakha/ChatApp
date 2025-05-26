const Chat = require("../Models/chatModel");
const asyncHandler = require("express-async-handler");
const generateToken = require("../Config/generateToken");
const User = require("../Models/userModel");
const Message = require("../Models/messageModel");

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  // Validate input: if content or chatId is missing, return error
  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400); // Bad Request
  }

  // Create a new message object
  let newMessage = {
    sender: req.user._id, // user ID is added by authentication middleware
    content: content,
    chat: chatId,
  };

  try {
    // Save the new message to the database
    let message = await Message.create(newMessage);

    // Populate the sender field to include name instead of just ObjectId
    message = await message.populate("sender", "name");

    // Populate the chat field to include full chat details
    message = await message.populate("chat");

    // Further populate the users inside the chat with name and email
    message = await message.populate({
      path: "chat.users",
      select: "name email",
    });

    // Update the Chat's latestMessage field to this newly created message
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    // Send the populated message as a JSON response
    res.json(message);
  } catch (error) {
    // In case of any error, respond with status 500 and the error message
    res.status(500).json({ message: error.message });
  }
});


// Importing asyncHandler to manage async errors
const allMessages = asyncHandler(async (req, res) => {
  try {
    // Find all messages that belong to the given chat ID (from URL parameter)
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name email") // Populate sender with only name and email
      .populate("chat"); // Populate the chat field with full chat data

    // Return the list of populated messages as JSON
    res.json(messages);
  } catch (error) {
    // Handle any errors that occur during message fetching
    res.status(500).json({ message: error.message });
  }
});


module.exports = { sendMessage,allMessages };
