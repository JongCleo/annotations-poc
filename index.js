import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "https://meet.google.com",
  },
  // transports: ["websocket"],
});

let connections = [];

io.on("connect", (socket) => {
  connections.push(socket);
  console.log(`${socket.id} has connected`);

  socket.on("sendDraw", (data) => {
    socket.broadcast.emit("receiveDraw", { x: data.x, y: data.y });
  });

  socket.on("sendCursor", (data) => {
    socket.broadcast.emit("receiveCursor", { x: data.x, y: data.y });
  });

  socket.on("disconnect", (reason) => {
    console.log(`${socket.id} has disconnected`);
    connections = connections.filter((con) => con.id !== socket.id);
  });
});

let PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`));
