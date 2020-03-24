const path = require("path");
const express = require("express");
const http = require("http");
const socket = require("socket.io");

const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const socketio = socket(server);
const botName = "Cosmo Bot";

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

socketio.on("connection", socket => {
  socket.on("joinChannel", ({ username, channel }) => {
    const user = userJoin(socket.id, username, channel);
    socket.join(user.channel);

    // Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to SocketChat"));

    // This will emit the event to all connected sockets
    socket.broadcast
      .to(user.channel)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the channel`)
      );

    // Send users and room info
    socketio.to(user.channel).emit("roomUsers", {
      channel: user.channel,
      users: getRoomUsers(user.channel)
    });
  });

  socket.on("message", msg => {
    const user = getCurrentUser(socket.id);

    console.log("message: " + msg);
    socketio
      .to(user.channel)
      .emit("message", formatMessage(user.username, msg));
  });

  socket.on("disconnect", () => {
    console.log("socket.id", socket.id);
    const user = userLeave(socket.id);
    console.log("user disconnected");
    if (user) {
      socketio
        .to(user.channel)
        .emit(
          "message",
          formatMessage(botName, `${user.username} has leave the channel!`)
        );

      // Send users and room info
      socketio.to(user.channel).emit("roomUsers", {
        channel: user.channel,
        users: getRoomUsers(user.channel)
      });
    }
  });
});

// Serving static html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
