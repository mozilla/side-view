async function init() {
  await browser.sideview.increaseSidebarMaxWidth();
  await browser.runtime.sendMessage({
    type: "sidebarOpened",
    width: Math.round(window.innerWidth / 50) * 50,
  });
}

init();
