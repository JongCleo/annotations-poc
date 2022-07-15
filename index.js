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
let screen_sharer_tabs = [];

io.on("connect", (socket) => {
  connections.push(socket);
  console.log(`${socket.id} has connected`);

  socket.on("sendDraw", (data) => {
    screen_sharer_tabs.map((tab) => {
      io.to(tab).emit("receiveDraw", { x: data.norm_x, y: data.norm_y });
    });
  });

  socket.on("sendCursor", (data) => {
    screen_sharer_tabs.map((tab) => {
      io.to(tab).emit("receiveCursor", { x: data.norm_x, y: data.norm_y });
    });
  });

  socket.on("sendScreenShareEvent", (data) => {
    screen_sharer_tabs.push(socket.id);
    socket.broadcast.emit("receiveScreenShareEvent");
  });

  socket.on("addScreenShareTab", () => {
    screen_sharer_tabs.push(socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log(`${socket.id} has disconnected`);
    connections = connections.filter((con) => con.id !== socket.id);
  });
});

let PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`));
