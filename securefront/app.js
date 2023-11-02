const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const PORT = process.env.PORT || 3002;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "/client")));

let userSockets = new Map();
let onlineUsers = [];

io.on("connection", (socket) => {
  socket.on("user-Active", (msg) => {
    console.log("USER ACTIVE SOCKET");
    console.log(msg.email)
    userSockets.set(socket.id, msg.email);

    onlineUsers = Array.from(new Set([...onlineUsers, msg.email]));
    
    io.emit("userAddedOrRemoved", onlineUsers);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server");

    const userEmail = userSockets.get(socket.id);

    userSockets.delete(socket.id);

    onlineUsers = onlineUsers.filter((user) => user !== userEmail);

    io.emit("userAddedOrRemoved", onlineUsers);
  });
});


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/login.html"));
});

app.get("/blog", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/post.html"));
});

server.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
