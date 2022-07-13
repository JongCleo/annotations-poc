let express = require("express");
let app = express()
let httpServer =require('http').createServer(app)
let io = require('socket.io')(httpServer)

let connections = []

io.on('connect', (socket) => {
  connections.push(socket);
  console.log(`${socket.id} has connected`);
  
  socket.on('sendDraw', (data) => {
    socket.broadcast.emit('receiveDraw', {x:data.x, y:data.y})    
  })

  socket.on('sendCursor', (data) => {
    socket.broadcast.emit('receiveCursor', {x:data.x, y:data.y})    
  })

  socket.on('disconnect', (reason) => {
    console.log(`${socket.id} has disconnected`);
    connections = connections.filter((con => con.id !== socket.id))
  })

})


app.use(express.static('public'))
let PORT = process.env.PORT || 8080
httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`))