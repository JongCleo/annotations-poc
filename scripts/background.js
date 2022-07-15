// chrome://inspect/#service-workers
const web_filter = {
  urls: ["https://meet.google.com/*/CreateMeetingDevice"],
};

chrome.webRequest.onCompleted.addListener(() => {
  // Detecting a Screen Share is a convoluted PIA
  // the webRequest API tells us half the story, but the on-page js need to confirm
  chrome.tabs.query({ url: ["https://meet.google.com/*"] }, ([tab]) => {
    setTimeout(() => {
      chrome.tabs.sendMessage(
        (tabId = tab.id),
        (message = { type: "checkScreenShare" })
      );
    }, 3000);
  });
}, web_filter);

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "setupSharerCanvases") {
    console.log("propagating script to all tabs");
    chrome.tabs.query({}, (tabs) => {
      tabs.map((tab, idx) => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["scripts/socket.io.js", "scripts/setup-sharer.js"],
        });
      });
    });
  }
  if (message.type === "keepAlive") {
    console.log("keepAlive");
  }
});
