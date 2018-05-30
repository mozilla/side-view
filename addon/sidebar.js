function element(selector) {
  return document.querySelector(selector);
}

function applyDarkTheme() {
  document.querySelector(".page").classList.add("dark-theme");
}

async function checkForDark() {
  browser.management.getAll().then((extensions) => {
    for (let extension of extensions) {
    // The user has the default dark theme enabled
    if (extension.id ===
      "firefox-compact-dark@mozilla.org@personas.mozilla.org"
      && extension.enabled) {
        applyDarkTheme();
      }
    }
  });
}

async function init() {
  await browser.runtime.sendMessage({
    type: "sidebarOpened",
    width: Math.round(window.innerWidth / 50) * 50,
  });
  element("#visit-test-pilot").onclick = () => {
    window.open("https://testpilot.firefox.com");
  };

  element("#watch-tutorial").onclick = () => {
    window.open("https://youtu.be/9Rgk1CegW2E");
  };

  element("#give-feedback").onclick = () => {
    window.open("https://qsurvey.mozilla.com/s3/side-view?ref=sidebar");
  };

  if (browser.sideview !== undefined) {
    await browser.sideview.increaseSidebarMaxWidth();
  }

  checkForDark();
  browser.management.onEnabled.addListener((info) => {
    checkForDark();
  });
}

init();
