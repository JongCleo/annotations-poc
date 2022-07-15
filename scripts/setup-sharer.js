var io = io.connect("http://localhost:8080");
io.emit("addScreenShareTab");
let canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.style.position = "absolute";
canvas.style.left = "0px";
canvas.style.top = "0px";
canvas.style.zIndex = "5";
canvas.style.pointerEvents = "none";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
let ctx = canvas.getContext("2d", {
  alpha: true,
});
let x;
let y;
let mouseDown = false;
let drawing_mode = false;

window.onkeydown = (e) => {
  drawing_mode = e.key == "d" ? true : false;
};

window.onkeyup = (e) => {
  drawing_mode = e.key == "d" ? false : true;
};

window.onmousedown = (e) => {
  ctx.moveTo(x, y);
  mouseDown = true;
};

window.onmouseup = (e) => {
  mouseDown = false;
};
window.onmousemove = (e) => {
  x = e.clientX;
  y = e.clientY;
  if (mouseDown && drawing_mode) {
    ctx.lineTo(x, y);
    ctx.stroke();
  }
};
io.on("receiveCursor", ({ x, y }) => {
  let new_x = x * ctx.canvas.width,
    new_y = y * ctx.canvas.height;
  ctx.moveTo(new_x, new_y);
});
io.on("receiveDraw", ({ x, y }) => {
  let new_x = x * ctx.canvas.width,
    new_y = y * ctx.canvas.height;
  console.log("normalized x, y" + x + "," + y);
  console.log("new x, y" + new_x + "," + new_y);
  ctx.lineTo(new_x, new_y);
  ctx.stroke();
});
