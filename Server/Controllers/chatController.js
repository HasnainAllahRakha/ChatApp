const Chat = require("../Models/chatModel");
const asyncHandler = require("express-async-handler");
const generateToken = require('../Config/generateToken')
const User = require("../Models/userModel");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body; // 👈 This is the ID of the user we want to chat with

  // Step 1: Validate if userId is provided
  if (!userId) {
    console.log("UserId not provided");
    return res.status(400).send({ message: "UserId is required" });
  }

  // Step 2: Search for an existing chat that is NOT a group chat
  let isChat = await Chat.find({
    isGroupChat: false, // 👈 We're only looking for 1-to-1 chats
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },     // 👈 Current logged-in user
      { users: { $elemMatch: { $eq: userId } } }            // 👈 Target user from request
    ]
  })
    .populate("users", "-password")          // 👈 Populate the users array (excluding password)
    .populate("latestMessage");              // 👈 Also fetch the latest message in this chat

  // Step 3: Populate the sender of the latest message with name and email
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name email", // 👈 Only bring name and email, not password
  });

  // Step 4: If chat already exists, send it back
  if (isChat.length > 0) {
    res.send(isChat[0]); // 👈 Return the existing chat
  } else {
    // Step 5: If chat doesn't exist, create a new one
    const chatData = {
      chatName: "sender", // 👈 Placeholder, not important in 1-to-1 chat
      isGroupChat: false,
      users: [req.user._id, userId], // 👈 Include both users in the chat
    };

    try {
      const createdChat = await Chat.create(chatData); // 👈 Save new chat

      const fullChat = await Chat.findOne({ _id: createdChat._id })
        .populate("users", "-password"); // 👈 Populate users again for frontend

      res.status(200).send(fullChat); // 👈 Send the new chat to frontend
    } catch (error) {
      res.status(400);
      throw new Error(error.message); // 👈 Send error if something goes wrong
    }
  }
});


const fetchChat = asyncHandler(async (req, res) => {
  try {
    // Step 1: Find all chats where the logged-in user is part of the chat
    Chat.find({
      users: { $elemMatch: { $eq: req.user._id } } // checks if current user is in users array
    })
    .populate("users", "-password") // fills in user details except password
    .populate("groupAdmin", "-password") // fills in group admin details except password
    .populate("latestMessage") // fills in latestMessage object (its full document)
    .sort({ updatedAt: -1 }) // sort chats by last updated time (newest first)

    // Step 2: Once all chats are found and populated...
    .then(async (results) => {
      // Further populate latestMessage.sender (nested population)
      results = await User.populate(results, {
        path: "latestMessage.sender", // go inside latestMessage and populate sender details
        select: "name email" // only include name and email
      });

      // Step 3: Send the fully populated result back to the client
      res.status(200).send(results);
    });

  } catch (error) {
    // If any error occurs, just return a 400 error
    res.status(400).send({ message: "Something went wrong while fetching chats." });
  }
});

const createGroup = asyncHandler(async (req, res) => {
  // Check if 'users' and 'name' are provided in the request body
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  // Parse the users array (it is sent as a JSON string)
  var users = JSON.parse(req.body.users); // This gives us an array of user objects or IDs

  // Check if there are at least 2 users to form a group (not counting the current user)
  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required for group chat");
  }

  // Add the currently logged-in user (req.user) to the users array
  users.push(req.user);

  try {
    // Create the group chat in the database
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users, // All users including the current user
      isGroupChat: true, // Marks this chat as a group chat
      groupAdmin: req.user, // The one creating the group is the admin
    });

    // Populate the users and group admin fields (get full details except passwords)
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    // Return the newly created group chat with populated user details
    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(500).send({ message: "Failed to create group", error: error.message });
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  // Extract chatId and new chatName from request body
  const { chatId, chatName } = req.body;

  // Update the chat's name based on chatId
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName: chatName },       // The new name to set
    { new: true }                 // Return the updated document
  )
    .populate("users", "-password")         // Replace user IDs with full user info (excluding password)
    .populate("groupAdmin", "-password");   // Replace groupAdmin ID with full info

  // If no chat found with that ID
  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat not found");
  } else {
    // Return the updated chat
    res.json(updatedChat);
  }
});

const removeGroup = asyncHandler(async (req, res) => {
 const {chatId,userId} = req.body;

 const removed = await Chat.findByIdAndUpdate(
  chatId,
  {
    $pull: {users: userId}
   
  },
   {new:true},
 )
   .populate("users", "-password")         // Replace user IDs with full user info (excluding password)
    .populate("groupAdmin", "-password");

      if (!removed) {
    res.status(404);
    throw new Error("Chat not found");
  } else {
    // Return the updated chat
    res.json(removed);
  }
});
const addtoGroup = asyncHandler(async (req, res) => {
 const {chatId,userId} = req.body;

 const added = await Chat.findByIdAndUpdate(
  chatId,
  {
    $push: {users: userId}
   
  },
   {new:true},
 )
   .populate("users", "-password")         // Replace user IDs with full user info (excluding password)
    .populate("groupAdmin", "-password");

      if (!added) {
    res.status(404);
    throw new Error("Chat not found");
  } else {
    // Return the updated chat
    res.json(added);
  }
});




module.exports = {accessChat,fetchChat,createGroup,renameGroup,removeGroup,addtoGroup};