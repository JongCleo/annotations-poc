let canvas = document.getElementById("canvas")

canvas.width = window.innerWidth;
canvas.height =  window.innerHeight;

// have to use var for whatever reason
var io = io.connect('http://localhost:8080');

let ctx = canvas.getContext("2d",{
  alpha: true
});

let x;
let y;
let mouseDown = false;


window.onmousedown = (e) => {
  ctx.moveTo(x, y)
  io.emit('sendCursor', {x,y})
  mouseDown = true;
}

window.onmouseup = (e) => {
  mouseDown = false;
}

io.on('receiveCursor', ({x,y})=>{
  ctx.moveTo(x,y)
})
io.on('receiveDraw', ({x, y}) => {
  ctx.lineTo (x, y);
  ctx.stroke();  
}) 
window.onmousemove = (e) => {
  x = e.clientX;
  y = e.clientY;
  if (mouseDown) {
    io.emit('sendDraw', {x,y})
    ctx.lineTo (x, y);
    ctx.stroke();  
  }
}
