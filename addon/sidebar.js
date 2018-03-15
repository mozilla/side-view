let lastDisplayedUrl;
let thisWindowId;
const ANIMATION_TIME = 300;
const rerenderEvents = ["onUpdated", "onRemoved", "onCreated", "onMoved", "onDetached", "onAttached"];

function displayPage(url, desktop, hasTransition = true ) {
  lastRenderedHomeInfo = null;
  slideUI(true, hasTransition);
  lastDisplayedUrl = url;
  element("#browser-iframe").src = url;
  let urlObj = new URL(url);
  element("#browser-domain").textContent = urlObj.hostname;
  element("#desktop").checked = !!desktop;
  for (let eventName of rerenderEvents) {
    browser.tabs[eventName].removeListener(updateHome);
  }
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
    element("#browser-iframe").src = "./loading.html";
  }, time);
}

async function displayHome(hasTransition = true) {
  slideUI(false, hasTransition);
  for (let eventName of rerenderEvents) {
    browser.tabs[eventName].addListener(updateHome);
  }
  await updateHome();
}

// This is used as a key to tell if we need to rerender home, or if what is currently
// displayed is the same as what would be newly displayed
let lastRenderedHomeInfo = null;

async function updateHome(event) {
  if (event) {
    // If this is called from an event, then often browser.windows.getCurrent() won't
    // be updated, and will return stale information, so we'll rerender a second time
    // very soon
    setTimeout(updateHome, 50);
    setTimeout(updateHome, 300);
  }
  const windowInfo = await browser.windows.getCurrent({populate: true});
  const tabList = element("#open-tabs-list");
  const newTabList = tabList.cloneNode();
  let thisRenderedHomeInfo = "";
  for (let tab of windowInfo.tabs) {
    if (!tab.url.startsWith("http")) continue;
    let li = document.createElement("li");
    let image = document.createElement("span");
    let text = document.createElement("span");
    image.classList.add("tab__image");
    text.classList.add("tab__text");
    let favIconUrl = null;
    if ("favIconUrl" in tab && tab.favIconUrl) {
      favIconUrl = tab.favIconUrl;
      image.style.backgroundImage = `url(${favIconUrl})`;
    }
    thisRenderedHomeInfo += favIconUrl + " ";
    let anchor = document.createElement("a");
    anchor.href = tab.url;
    thisRenderedHomeInfo += tab.url + " ";
    anchor.classList.add("tab");
    text.textContent = tab.title;
    thisRenderedHomeInfo += tab.title + "\n";
    anchor.addEventListener("click", (event) => {
      browser.runtime.sendMessage({
        type: "sidebarOpenedPage",
        windowId: windowInfo.id,
        url: event.target.href
      });
      displayPage(event.target.href);
      event.preventDefault();
      return false;
    });
    anchor.prepend(image);
    anchor.appendChild(text);
    li.appendChild(anchor);
    newTabList.appendChild(li);
  }
  if (thisRenderedHomeInfo !== lastRenderedHomeInfo) {
    tabList.replaceWith(newTabList);
    lastRenderedHomeInfo = thisRenderedHomeInfo;
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
  browser.runtime.sendMessage({type: "sidebarDisplayHome", windowId: thisWindowId});
  displayHome();
});

element("#desktop").addEventListener("change", async (event) => {
  let desktop = event.target.checked;
  await browser.runtime.sendMessage({type: "setDesktop", desktop, url: lastDisplayedUrl});
  sendEvent("selectDesktop", desktop ? "on" : "off");
  displayPage(lastDisplayedUrl, desktop, false);
});

element("#refresh").addEventListener("click", () => {
  sendEvent("refresh");
  element("#browser-iframe").src = lastDisplayedUrl;
});

async function init() {
  const windowInfo = await browser.windows.getCurrent();
  thisWindowId = windowInfo.id;

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

  browser.runtime.sendMessage({type: "sidebarOpened", windowId: thisWindowId});

  displayHome(false);
}

init();
