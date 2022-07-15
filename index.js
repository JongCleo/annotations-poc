import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

// app is a fn designed to be an http request listener
// it is passed (req,res) on incoming requests
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

let connections = [];
let screen_sharer;

io.on("connect", (socket) => {
  connections.push(socket);
  console.log(`${socket.id} has connected`);

  socket.on("sendDraw", (data) => {
    io.to(screen_sharer).emit("receiveDraw", { x: data.x, y: data.y });
  });

  socket.on("sendCursor", (data) => {
    io.to(screen_sharer).emit("receiveCursor", { x: data.x, y: data.y });
  });

  socket.on("sendScreenShareEvent", (data) => {
    screen_sharer = socket.id;
    socket.broadcast.emit("receiveScreenShareEvent");
  });

  socket.on("disconnect", (reason) => {
    console.log(`${socket.id} has disconnected`);
    connections = connections.filter((con) => con.id !== socket.id);
  });
});

let PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`));
