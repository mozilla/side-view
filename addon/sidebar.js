/* globals buildSettings */

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
  try {
    await browser.runtime.sendMessage({
      type: "sidebarOpened",
      width: Math.round(window.innerWidth / 50) * 50,
    });
  } catch (e) {
    console.warn("Error contacting background page from Side View sidebar:", String(e));
  }
  element("#visit-test-pilot").onclick = () => {
    window.open("https://testpilot.firefox.com");
  };

  element("#watch-tutorial").onclick = () => {
    window.open("https://youtu.be/no6D_B4wgo8");
  };

  if (buildSettings.isAmo) {
    element("#give-feedback").style.display = "none";
  } else {
    element("#give-feedback").onclick = () => {
      window.open("https://qsurvey.mozilla.com/s3/side-view?ref=sidebar");
    };
  }

  if (browser.sideview !== undefined) {
    await browser.sideview.increaseSidebarMaxWidth();
  }

  checkForDark();
  browser.management.onEnabled.addListener((info) => {
    checkForDark();
  });
}

init();
