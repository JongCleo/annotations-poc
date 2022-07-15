chrome.action.onClicked.addListener((tab) => {
  // needs to be var for w.e reason
  var io = io.connect("http://localhost:8080");

  console.log("Injecting Canvas for Screen Sharer");

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: [
      ["socket.io.js", setupCanvas, setupIOSends(io), setupIOReceives(io)],
    ],
  });
});

const setupCanvas = () => {
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
};

const setupIOSends = (io) => {
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
    io.emit("sendCursor", { x, y });
    mouseDown = true;
  };

  window.onmouseup = (e) => {
    mouseDown = false;
  };
  window.onmousemove = (e) => {
    x = e.clientX;
    y = e.clientY;
    if (mouseDown && drawing_mode) {
      io.emit("sendDraw", { x, y });
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };
};

const setupIOReceives = (io) => {
  io.on("receiveCursor", ({ x, y }) => {
    ctx.moveTo(x, y);
  });
  io.on("receiveDraw", ({ x, y }) => {
    ctx.lineTo(x, y);
    ctx.stroke();
  });
};
