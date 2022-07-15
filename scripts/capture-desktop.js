const setupCanvas = () => {
  canvas = document.createElement("canvas");
  canvas.id = "canvas";
  canvas.style.position = "absolute";
  canvas.style.left = "0px";
  canvas.style.top = "0px";
  canvas.style.zIndex = "5";
  canvas.style.pointerEvents = "none";
  // document.body.appendChild(canvas);
  ctx = canvas.getContext("2d", {
    alpha: true,
  });
};

const setupWatcherActions = () => {
  let screen_share_element =
    document.getElementsByTagName("video")[0].parentElement.parentElement;
  canvas.width = screen_share_element.clientWidth;
  canvas.height = screen_share_element.clientHeight;
  screen_share_element.appendChild(canvas);

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
    let norm_x = x / ctx.canvas.width,
      norm_y = y / ctx.canvas.height;
    console.log("old x, y" + x + "," + y);
    console.log("normalized x, y" + norm_x + "," + norm_y);
    io.emit("sendCursor", { norm_x, norm_y });
    mouseDown = true;
  };

  window.onmouseup = (e) => {
    mouseDown = false;
  };
  window.onmousemove = (e) => {
    x = e.clientX;
    y = e.clientY;
    if (mouseDown && drawing_mode) {
      let norm_x = x / ctx.canvas.width,
        norm_y = y / ctx.canvas.height;
      io.emit("sendDraw", { norm_x, norm_y });
      ctx.lineTo(x, y);
      ctx.stroke();
      // assuming little latency, immediately erase the stroke
    }
  };
};

//////////////////////////////////// MAIN

// GLOBALS
let canvas;
let ctx;
var io = io.connect("http://localhost:8080");
setupCanvas();
io.on("receiveScreenShareEvent", () => {
  setupWatcherActions();
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "checkScreenShare") {
    console.log("received event in the right fukin tab");
    if (document.body.innerHTML.search("You're presenting to everyone") >= 0) {
      console.log("Seting up Screen Sharer's drawing capability");
      chrome.runtime.sendMessage({ type: "setupSharerCanvases" });
      // setupSharerActions();
      console.log("Seting up canvases for other call participants...");
      io.emit("sendScreenShareEvent");
    }
  }
});
