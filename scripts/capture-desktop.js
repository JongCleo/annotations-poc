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

const normalizeCanvasCoords = (x, y) => {
  x = (x - boundingBox.left) / ctx.canvas.width;
  y = (y - boundingBox.top) / ctx.canvas.height;
  return { norm_x: x, norm_y: y };
};

const setupWatcherActions = () => {
  console.log("setting up watcher actions");
  let screen_share_element;
  for (let video of document.getElementsByTagName("video")) {
    if (video.style.display != "none") {
      screen_share_element = video.parentElement;
      console.log("found the screenshare");
      break;
    }
  }

  canvas.width = screen_share_element.clientWidth;
  canvas.height = screen_share_element.clientHeight;
  screen_share_element.parentElement.appendChild(canvas);
  boundingBox = canvas.getBoundingClientRect();

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
    let { norm_x, norm_y } = normalizeCanvasCoords(x, y);
    console.log("old x, y" + x + "," + y);
    console.log("normalized x, y" + norm_x + "," + norm_y);
    io.emit("sendCursor", { norm_x, norm_y });
    mouseDown = true;
  };

  window.onmouseup = (e) => {
    mouseDown = false;
  };
  window.onmousemove = (e) => {
    x = e.clientX - boundingBox.left;
    y = e.clientY - boundingBox.top;
    if (mouseDown && drawing_mode) {
      let { norm_x, norm_y } = normalizeCanvasCoords(x, y);

      io.emit("sendDraw", { norm_x, norm_y });
    }
  };
};

//////////////////////////////////// MAIN

// GLOBALS
let canvas;
let ctx;
let boundingBox;
var io = io.connect("http://localhost:8080");
setupCanvas();
io.on("receiveScreenShareEvent", () => {
  setupWatcherActions();
});

chrome.runtime.sendMessage({ type: "keepAlive" });
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "checkScreenShare") {
    if (document.body.innerHTML.search("You're presenting to everyone") >= 0) {
      console.log("Seting up Screen Sharer's drawing capability");
      chrome.runtime.sendMessage({ type: "setupSharerCanvases" });
      console.log("Seting up canvases for other call participants...");
      io.emit("sendScreenShareEvent");
    }
  }
});
