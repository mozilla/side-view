function element(selector) {
  return document.querySelector(selector);
}

async function init() {
  await browser.sideview.increaseSidebarMaxWidth();
  await browser.runtime.sendMessage({
    type: "sidebarOpened",
    width: Math.round(window.innerWidth / 50) * 50,
  });
  element("#visit-test-pilot").onclick = () => {
    window.open("https://testpilot.firefox.com");
  };
  element("#watch-tutorial").onclick = () => {
    // TODO insert tutorial link here
    // window.open("https://testpilot.firefox.com");
  };
  element("#give-feedback").onclick = () => {
    window.open("https://qsurvey.mozilla.com/s3/Test-Pilot-Side-View?ref=sidebar");
  };
}

init();
