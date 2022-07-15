const setupCanvas = () => {
  canvas = document.createElement("canvas");
  canvas.id = "canvas";
  canvas.style.position = "absolute";
  canvas.style.left = "0px";
  canvas.style.top = "0px";
  canvas.style.zIndex = "5";
  canvas.style.pointerEvents = "none";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d", {
    alpha: true,
  });
};
const overrideScreenShare = () => {
  window.addEventListener("message", (event) => {
    if (String(event.data).includes("ready:")) {
      const screen_share_button = document.getElementsByClassName(
        "VfPpkd-Bz112c-LgbsSe yHy1rc eT1oJ tWDL4c uaILN"
      )[2];
      console.log("found the button, overriding on click");
      screen_share_button.onclick = () => {
        navigator.mediaDevices
          .getDisplayMedia()
          .then(() => {
            console.log("Seting up Screen Sharer's drawing capability");
            // maybe emit to background.js so it gets propagated to all of the sharer's tab
            setupSharerActions();

            console.log("Seting up canvases for other call participants...");
            io.emit("sendScreenShareEvent");
          })
          .catch((err) => {
            console.error("Error while attempting screen share:" + err);
          });
      };
    }
  });
};

const setupIOReceives = () => {
  io.on("receiveCursor", ({ x, y }) => {
    ctx.moveTo(x, y);
  });
  io.on("receiveDraw", ({ x, y }) => {
    ctx.lineTo(x, y);
    ctx.stroke();
  });
  io.on("receiveScreenShareEvent", () => {
    setupWatcherActions();
  });
};
const setupWatcherActions = () => {
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
      // assuming little latency, immediately erase the stroke
    }
  };
};

const setupSharerActions = () => {
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
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };
};

//////////////////////////////////// MAIN

// GLOBALS
let canvas;
let ctx;
var io = io.connect("http://localhost:8080");

setupCanvas();
setupIOReceives();
overrideScreenShare();
