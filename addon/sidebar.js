

function sendEvent(args) {
  // We bucket to the nearest 50px:
  args.cd1 = Math.round(window.innerWidth / 50) * 50;
  args.type = "sendEvent";
  browser.runtime.sendMessage(args);
}

function element(selector) {
  return document.querySelector(selector);
}

element(".feedback-button").addEventListener("click", () => {
  sendEvent({
    ec: "interface",
    ea: "button-click",
    el: "feedback",
  });
});

async function init() {
  await browser.sideview.increaseSidebarMaxWidth();
}

init();
