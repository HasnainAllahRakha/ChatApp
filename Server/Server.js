require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const routes = require("./Routes/index.routes");
const cors = require("cors");
const colors = require("colors");
const http = require("http"); // Required for socket server
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); // Create HTTP server from Express
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
 origin: "*",   
    credentials: true,
  },
});

// Middleware

app.use(
  cors({
   origin: "*",   
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use(routes);

// When a new client connects to the server via Socket.IO
io.on("connection", (socket) => {
  console.log("🔌 Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join-chat", (room) => {
    socket.join(room);
  });
  socket.on("new-message", (newMessageReceived) => {
    let chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageReceived); // Make sure the user has joined the room named by their _id
    });
  });

socket.on("typing", ({ room, user }) => {
  socket.in(room).emit("typing", user);
});

socket.on("stop-typing", ({ room }) => {
  socket.in(room).emit("stop-typing");
});

  socket.on("disconnect", () => {
    console.log("❌ Disconnected from socket.io");
  });
});

const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(port, "0.0.0.0", () => {
      console.log(
        `✅ MongoDB connected & server running on port ${port}`.magenta.bold
      );
    });
  })
  .catch((error) => {
    console.log(error);
  });
