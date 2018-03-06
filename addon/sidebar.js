let lastDisplayedUrl;
const ANIMATION_TIME = 300;

function displayPage(url, desktop, hasTransition = true ) {
  slideUI(true, hasTransition);
  lastDisplayedUrl = url;
  element("#browser-iframe").src = url;
  let urlObj = new URL(url);
  element("#browser-domain").textContent = urlObj.hostname;
  element("#desktop").checked = !!desktop;
  browser.tabs.onUpdated.removeListener(updateHome);
}

// helper function for state changes
function slideUI(showBrowser, hasTransition) {
  const browserContainer = element("#browser-container");
  const homeContainer = element("#home-container");
  const time = hasTransition ? ANIMATION_TIME : 0;
  if (showBrowser) {
    browserContainer.style.transitionDuration = `${time}ms`;
    browserContainer.style.transform = "translate3D(0, 0, 0)";
    hideViewAfter(homeContainer, time);
  } else {
    browserContainer.style.transform = "translate3D(100%, 0, 0)";
    homeContainer.style.display = "block";
    dumpIframeContentsAfter(time);
  }
}

// helper function for delayed view hiding
function hideViewAfter(element, time) {
  setTimeout(() => {
    element.style.display = "none";
  }, time);
}

// so that iframe doesn't flash on next load,
// clear it after css animates it out.
function dumpIframeContentsAfter(time) {
  setTimeout(() => {
    element("#browser-iframe").src = "about:blank";
  }, time);
}

async function displayHome(hasTransition = true) {
  slideUI(false, hasTransition);
  browser.tabs.onUpdated.addListener(updateHome);
  await updateHome();
}

async function updateHome() {
  const windowInfo = await browser.windows.getCurrent({populate: true});
  const tabList = element("#open-tabs-list");
  tabList.innerHTML = "";
  for (let tab of windowInfo.tabs) {
    if (!tab.url.startsWith("http")) continue;
    let li = document.createElement("li");
    let image = document.createElement("span");
    let text = document.createElement("span");
    image.classList.add("tab__image");
    text.classList.add("tab__text");
    image.style.backgroundImage = `url(${tab.favIconUrl})`;
    let anchor = document.createElement("a");
    anchor.href = tab.url;
    anchor.classList.add("tab");
    text.textContent = tab.title;
    anchor.addEventListener("click", (event) => {
      displayPage(event.target.href);
      event.preventDefault();
      return false;
    });
    anchor.prepend(image);
    anchor.appendChild(text);
    li.appendChild(anchor);
    tabList.appendChild(li);
  }
}

function sendEvent(ec, ea, eventParams) {
  browser.runtime.sendMessage({type: "sendEvent", ec, ea, eventParams});
}

function element(selector) {
  return document.querySelector(selector);
}

element("#home").addEventListener("click", () => {
  sendEvent("goHome", "click");
  displayHome();
});

element("#desktop").addEventListener("change", async (event) => {
  let desktop = event.target.checked;
  await browser.runtime.sendMessage({type: "setDesktop", desktop, url: lastDisplayedUrl});
  sendEvent("selectDesktop", desktop ? "on" : "off");
  displayPage(lastDisplayedUrl, desktop, false);
});

async function init() {
  const windowInfo = await browser.windows.getCurrent();
  const thisWindowId = windowInfo.id;

  browser.runtime.onMessage.addListener((message) => {

    if (message.windowId && thisWindowId && message.windowId !== thisWindowId) {
      // Not intended for this window
      return;
    }
    if (message.type === "browse") {
      displayPage(message.url, message.desktop, false);
    } else {
      console.error("Got unexpected message:", message);
    }
  });

  displayHome(false);
}

init();
